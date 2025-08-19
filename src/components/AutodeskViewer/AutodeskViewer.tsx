import { useCallback, useEffect, useRef, FC, useState } from 'react';
import { getGlobalOffset } from '../../heplers/viewerHelpers';
import ViewerEventArgs = Autodesk.Viewing.ViewerEventArgs;

type Props = {
  /**
   * The URN of the model to load in Autodesk Viewer.
   * Example: `dXJuOmFkc2subW9kZWw6...` or [`dXJuOmFkc2subW9kZWw6...`, `dXJuOmFkc2subW9kZWw6...`, etc.]
   */
  urn: string | string[];
  /**
   * Runtime configuration for Autodesk Viewer.
   * accessToken: string;
   *  env: string;
   *  api: string;
   */
  runtime: {
    accessToken: string;
    env: string;
    api: string;
  };
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
   * The theme of the viewer.
   */
  theme?: 'light' | 'dark';
};

interface IRuntime {
  options: Autodesk.Viewing.InitializerOptions;
  ready: Promise<void> | null;
}

const runtime: IRuntime = {
  options: {},
  ready: null,
};

async function initializeViewerRuntime(options: Autodesk.Viewing.InitializerOptions) {
  if (!runtime.ready) {
    const script = document.createElement('script');
    // script.src = '/viewer3D.min.js';
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.109.0/viewer3D.min.js';
    document.head.appendChild(script);

    const link = document.createElement('link');
    // link.href = '/style.min.css';
    link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.109.0/style.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    await new Promise(resolve => {
      script.onload = resolve;
    });

    runtime.options = { ...options };
    runtime.ready = new Promise(resolve => Autodesk.Viewing.Initializer(runtime.options, resolve));
  } else {
    if (
      // ['accessToken', 'getAccessToken', 'env', 'api', 'language']
      // Remove access token from the array because refresh from back returns every time a new token, and it leads to reject here
      ['getAccessToken', 'env', 'api', 'language'].some(prop => {
        return options[prop] !== runtime.options[prop];
      })
    ) {
      return Promise.reject('Cannot initialize another viewer runtime with different settings.');
    }
  }
  return runtime.ready;
}

export const AutodeskViewer: FC<Props> = ({
  urn,
  runtime,
  viewableId,
  useSharedCoordinateSystem,
  mappingCallback,
  clearCallback,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewer, setViewer] = useState<Autodesk.Viewing.GuiViewer3D | null>(null);

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

  const updateViewerState = useCallback(() => {
    if (!viewer || !viewer?.container) return;
    const urns = Array.isArray(urn) ? urn : [urn]; // support single or multiple
    urns.forEach((urn, idx) =>
      Autodesk.Viewing.Document.load(
        'urn:' + urn,
        async (doc: Autodesk.Viewing.Document) => {
          await doc.downloadAecModelData();

          const root = doc.getRoot();
          const selectedView = root.findByGuid(viewableId);
          const defaultView = root.getNamedViews().find((v: any) => v.data.name === 'Default View');
          const newConstructionView = root.getNamedViews().find((v: any) => v.data.name === 'New Construction');
          const defaultModel = root.getDefaultGeometry();

          // Pick priority: selectedView > Default View > New Construction > Default Geometry
          const viewable = selectedView || defaultView || newConstructionView || defaultModel;

          const globalOffset = await getGlobalOffset(doc, viewer, viewable);

          await viewer.loadDocumentNode(doc, viewable, {
            applyRefPoint: useSharedCoordinateSystem,
            keepCurrentModels: idx !== 0,
            globalOffset: useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 },
          });
        },
        (code, message, errors) => {
          console.error(code, message, errors);
        },
      ),
    );
  }, [urn, viewableId, useSharedCoordinateSystem, viewer]);

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
    if (viewer) return;
    if (!containerRef.current) return;

    initializeViewerRuntime(runtime || {})
      .then(() => {
        const viewerInstance =
          containerRef.current &&
          new Autodesk.Viewing.GuiViewer3D(containerRef.current, {
            theme: theme === 'dark' ? 'dark-theme' : 'light-theme',
          });
        setViewer(viewerInstance);
      })
      .catch((err: any) => {
        console.error('viewer initialize error', err);
      });
  }, [viewer, containerRef]);

  useEffect(() => {
    if (!viewer || !viewer?.container) return;
    viewer.start();

    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
    viewer.addEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);

    updateViewerState();

    return () => {
      clearCallback && clearCallback();

      if (!viewer || !viewer?.container) return;

      viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
      viewer.removeEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
      viewer.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);

      viewer.tearDown();
      viewer.finish();
    };
  }, [viewer, onGeometryLoaded, onModelAdded, onInstTreeCreated, updateViewerState]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
