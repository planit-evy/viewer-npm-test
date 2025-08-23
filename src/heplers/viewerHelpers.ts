//get global offset fot shared coordinate
import { IGlobalOffest, ILoadModel, ISelection, IUnloadModel } from './viewerHelper.types';

export const getGlobalOffset = async (props: IGlobalOffest) => {
  const bubbleNode = props.node ? props.node : props.doc.getRoot().getDefaultGeometry();
  await props.doc.downloadAecModelData();
  const aecModelData = bubbleNode.getAecModelData();
  const tf = aecModelData && aecModelData.refPointTransformation;

  let globalOffset = props.viewerInst.model?.getData().globalOffset;
  const refPoint = tf ? new THREE.Vector3(tf[9], tf[10], tf[11]) : new THREE.Vector3(0, 0, 0);

  // Check if the current globalOffset is close enough to the refPoint to avoid inaccuracies.
  const MaxDistSqr = 4.0e6;
  const distSqr = globalOffset && THREE.Vector3.prototype.distanceToSquared.call(refPoint, globalOffset);
  if (!globalOffset || distSqr > MaxDistSqr) {
    globalOffset = new THREE.Vector3().copy(refPoint);
  }
  return globalOffset;
};

export const getAggregateSelection = (props: ISelection) => {
  const aggregatedDbIds: { model: any; ids: number[] }[] = [];

  const allFragIds = [];

  props.guidsAndModels.forEach(({ model, guidsToDbids }) => {
    const dbIds = props.guids.map(guid => guidsToDbids[guid]).filter((el: number) => el);
    if (!dbIds.length) return;
    aggregatedDbIds.push({ model: model, ids: dbIds });

    dbIds?.forEach((id: number) => {
      model.getInstanceTree().enumNodeFragments(id, (fragId: number) => {
        allFragIds.push(fragId);
      });
    });
  });

  if (!allFragIds.length) {
    return;
  }

  //@ts-ignore
  props.viewer.setAggregateSelection();
  //@ts-ignore
  props.isolate && props.viewer.setAggregateIsolation();
  props.viewer.setAggregateSelection(aggregatedDbIds);
  //@ts-ignore
  props.isolate && viewer.setAggregateIsolation(aggregatedDbIds);
  props.zoom &&
    props.viewer.fitToView(
      //@ts-ignore
      aggregatedDbIds.map(el => {
        return { model: el.model, selection: el.ids };
      }),
    );
};

export const loadModelByUrn = (props: ILoadModel) => {
  Autodesk.Viewing.Document.load(
    'urn:' + props.urn,
    async doc => {
      const root = doc.getRoot();
      const selectedView = root.findByGuid(props.loadModelViewableId || '');
      const defaultView = root.getNamedViews().find((v: any) => v.data.name === 'Default View');
      const newConstructionView = root.getNamedViews().find((v: any) => v.data.name === 'New Construction');
      const defaultModel = root.getDefaultGeometry();

      // Pick priority: selectedView > Default View > New Construction > Default Geometry
      const viewable = selectedView || defaultView || newConstructionView || defaultModel;

      const globalOffset = await getGlobalOffset({ doc: doc, viewerInst: props.viewer, node: viewable });

      await props.viewer.loadDocumentNode(doc, viewable, {
        preserveView: props.preserveView,
        applyRefPoint: !!props.useSharedCoordinateSystem,
        keepCurrentModels: !!props.keepCurrentModels,
        globalOffset: !!props.useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 },
      });
    },
    (code, message, errors) => console.error('LOAD MODEL ERROR', code, message, errors),
  );
};

export const unloadModelByUrn = (props: IUnloadModel) => {
  const allLoadedModels = props.viewer.getAllModels();
  const modelToUnload = allLoadedModels.find(model => model.getData().urn === props.urn);
  props.viewer.unloadModel(modelToUnload);
  props.callbackToUpdatedMapping && props.callbackToUpdatedMapping(props.urn);
};

export const getObjectPropsByGuid = (props: { guid: string; viewer: any }) => {
  //TODO implement
  // e.target.model.getBulkProperties2
  // return new Promise((resolve, reject) => {
  //   model.getBulkProperties2(
  //     dbIds,
  //     { propFilter: ['externalId'], categoryFilter: undefined, ignoreHidden: true, needExternalId: true },
  //     (props) => {
  //       const dict: { [key: string]: number } = {};
  //       props.forEach(el => {
  //         if (el.externalId) {
  //           dict[el.externalId] = el.dbId;
  //         }
  //       });
  //       console.log('Found leaf dbids processed');
  //       resolve({ model, guidsToDbids: dict });
  //     },
  //     (err) => {
  //       console.log('Mapping GUID to DBID error', err);
  //       reject(err);
  //     }
  //   );
  // });
};
