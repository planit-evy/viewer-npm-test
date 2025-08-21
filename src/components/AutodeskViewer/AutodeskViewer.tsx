import { useCallback, useEffect, useRef, FC } from 'react';
import { getGlobalOffset } from '../../heplers/viewerHelpers';
import ViewerEventArgs = Autodesk.Viewing.ViewerEventArgs;

type Props = {
  /**
   * The URN of the model to load in Autodesk Viewer.
   * Example: `dXJuOmFkc2subW9kZWw6...` or [`dXJuOmFkc2subW9kZWw6...`, `dXJuOmFkc2subW9kZWw6...`, etc.]
   */
  urn: string | string[];
  /**
   * The access token to use for authentication. Should be retrieved from your server.
   */
  accessToken: string;
  /**
   * The ID of the viewable to load. If you don't provide this, the default viewable will be loaded'
   * View priority: selectedView > Default View > New Construction > Default Geometry (means Viewer method)
   */
  viewableId?: string;
  /**
   * Whether to use a shared coordinate system for the model.
   * Default: false
   */
  useSharedCoordinateSystem?: boolean;
  /**
   * Callback function to handle the mapping of GUIDs to DBIDs.
   * @param modelMapping - An object containing the model and its GUID-to-DBID mapping.
   */
  mappingCallback?: (arg: any) => void;
  /**
   * Callback function to clear any cached data or state.
   * Here I mean to clear all data that a user gets from any callback from viewer.
   */
  clearCallback?: () => void;
  /**
   * The environment to use for Autodesk Viewer.
   * Default: 'AutodeskProduction2'
   */
  viewerEnv?: 'AutodeskProduction' | 'AutodeskProduction2';
  /**
   * The API to use for Autodesk Viewer.
   * Default: 'derivativeV2'
   */
  viewerApi?: 'streamingV2' | 'derivativeV2';
  /**
   * The theme to use for Autodesk Viewer.
   * Default: 'light-theme'
   */
  theme?: 'light-theme' | 'dark-theme';
  /**
   * The version of Autodesk Viewer to use.
   * Default: '7.111.0'
   * The latest updates could be checked here: https://aps.autodesk.com/en/docs/viewer/v7/change_history/changelog_v7/
   */
  version?: string;
};

export const AutodeskViewer: FC<Props> = ({
  urn,
  accessToken,
  viewableId,
  useSharedCoordinateSystem,
  mappingCallback,
  clearCallback,
  viewerEnv = 'AutodeskProduction2',
  viewerApi = 'derivativeV2',
  theme = 'light-theme',
  version = '7.111.0',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  if (typeof window === 'undefined') return null;

  const getAllLeafComponents = (viewer: Autodesk.Viewing.Viewer3D, callback: (arg: number[]) => void) => {
    let cbCount = 0; // count pending callbacks
    const components: number[] = []; // store the results
    let tree = viewer.model.getData().instanceTree as Autodesk.Viewing.InstanceTree; // the instance tree

    function getLeafComponentsRec(parent: number) {
      cbCount++;
      if (tree.getChildCount(parent) != 0) {
        tree.enumNodeChildren(
          parent,
          function (children) {
            getLeafComponentsRec(children);
          },
          false,
        );
      } else {
        components.push(parent);
      }
      if (--cbCount == 0) callback(components);
    }
    viewer.getObjectTree(function (objectTree) {
      tree = objectTree;
      getLeafComponentsRec(tree.getRootId());
    });
  };

  const onGeometryLoaded = useCallback((e: ViewerEventArgs) => {
    console.log('Geometry loaded', e);
  }, []);

  const onModelAdded = useCallback((e: ViewerEventArgs) => {
    console.log('Model added', e);
  }, []);

  const onInstTreeCreated = useCallback(async (e: ViewerEventArgs) => {
    getAllLeafComponents(e.target, function (dbIds: number[]) {
      console.log('Found ' + dbIds.length + ' leaf nodes');

      e.target.model.getBulkProperties2(
        dbIds,
        { propFilter: ['externalId'], categoryFilter: undefined, ignoreHidden: true, needExternalId: true },
        arg => {
          const dict: { [key: string]: number } = {};
          arg.forEach(el => {
            if (el.externalId) {
              dict[el.externalId] = el.dbId;
            }
          });
          console.log('Found leaf dbids processed');
          const modelMapping = { model: e.model, guidsToDbids: dict };
          console.log({ model: e.model, guidsToDbids: dict });
          //in mapping callback needs to handle save previous state due to model load queue
          mappingCallback && mappingCallback(modelMapping);
        },
        err => {
          console.log('Mapping GUID to DBID error', err);
        },
      );
    });
  }, []);

  useEffect(() => {
    if (!viewerRef.current) {
      async function loadViewer() {
        await loadForgeViewer(version);

        const options = {
          env: viewerEnv,
          api: viewerApi,
          accessToken,
        };

        const viewerOptions = {
          extensions: ['Autodesk.DocumentBrowser'],
          theme: theme,
        };

        Autodesk.Viewing.Initializer(options, () => {
          window?.NOP_VIEWER?.finish();
          window?.NOP_VIEWER?.tearDown();

          viewerRef.current = new Autodesk.Viewing.GuiViewer3D(containerRef.current, viewerOptions);
          viewerRef.current.start();

          const urns = Array.isArray(urn) ? urn : [urn]; // support single or multiple

          const loadModelFromUrn = async (urn: string, isFirst: boolean) => {
            const documentId = `urn:${urn}`;
            Autodesk.Viewing.Document.load(
              documentId,
              async (doc: any) => {
                const root = doc.getRoot();
                const selectedView = root.findByGuid(viewableId);
                const defaultView = root.getNamedViews().find((v: any) => v.data.name === 'Default View');
                const newConstructionView = root.getNamedViews().find((v: any) => v.data.name === 'New Construction');
                const defaultModel = root.getDefaultGeometry();

                // Pick priority: selectedView > Default View > New Construction > Default Geometry
                const viewable = selectedView || defaultView || newConstructionView || defaultModel;

                const globalOffset = await getGlobalOffset({ doc: doc, viewerInst: viewerRef.current, node: viewable });

                await viewerRef.current.loadDocumentNode(doc, viewable, {
                  applyRefPoint: useSharedCoordinateSystem,
                  keepCurrentModels: !isFirst,
                  globalOffset: useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 },
                });
              },
              (errCode: any, msg: any) => {
                console.error(`Failed to load document ${urn}`, errCode, msg);
              },
            );
          };

          // Load all models in sequence
          urns.forEach((u, idx) => loadModelFromUrn(u, idx === 0));

          // Events
          viewerRef.current.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
          viewerRef.current.addEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
          viewerRef.current.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);
        });
      }
      //@ts-ignore
      loadViewer().then(() => console.log('VIEWER LOADED', viewerRef.current, window?.NOP_VIEWERS));
    }
    return () => {
      viewerRef.current?.tearDown();
      viewerRef.current?.finish();

      //clear all event listeners
      viewerRef.current?.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
      viewerRef.current?.removeEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
      viewerRef.current?.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);

      viewerRef.current = null;
      //clear all data
      clearCallback && clearCallback();
    };
  }, [urn, accessToken, onGeometryLoaded, onModelAdded, onInstTreeCreated, clearCallback]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const _entry of entries) {
        window?.NOP_VIEWER && window.NOP_VIEWER.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

// Load viewer from local files
async function loadForgeViewer(version: string) {
  // If already loaded, just return
  if ((window as any).Autodesk?.Viewing) return;

  if (document.getElementById('forge-viewer-script')) {
    // script already injected but maybe not finished loading
    await new Promise(resolve => {
      (document.getElementById('forge-viewer-script') as HTMLScriptElement).onload = resolve;
    });
    return;
  }

  const script = document.createElement('script');
  script.id = 'forge-viewer-script';
  script.src = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${version}/viewer3D.min.js`;
  document.head.appendChild(script);

  const link = document.createElement('link');
  link.href = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${version}/style.min.css`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  await new Promise(resolve => {
    script.onload = resolve;
  });
}
