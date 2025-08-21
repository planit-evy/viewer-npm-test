//get global offset fot shared coordinate
export const getGlobalOffset = async (
  doc: Autodesk.Viewing.Document,
  viewerInst: Autodesk.Viewing.Viewer3D,
  node?: Autodesk.Viewing.BubbleNode,
) => {
  const bubbleNode = node ? node : doc.getRoot().getDefaultGeometry();
  await doc.downloadAecModelData();
  const aecModelData = bubbleNode.getAecModelData();
  const tf = aecModelData && aecModelData.refPointTransformation;

  let globalOffset = viewerInst.model?.getData().globalOffset;
  const refPoint = tf ? new THREE.Vector3(tf[9], tf[10], tf[11]) : new THREE.Vector3(0, 0, 0);

  // Check if the current globalOffset is close enough to the refPoint to avoid inaccuracies.
  const MaxDistSqr = 4.0e6;
  const distSqr = globalOffset && THREE.Vector3.prototype.distanceToSquared.call(refPoint, globalOffset);
  if (!globalOffset || distSqr > MaxDistSqr) {
    globalOffset = new THREE.Vector3().copy(refPoint);
  }
  return globalOffset;
};

export const getAggregateSelection = (
  /**
   * The viewer instance to use for setting the aggregate selection.
   */
  viewer: Autodesk.Viewing.GuiViewer3D,
  /**
   * The GUIDs array to select or isolate.
   */
  guids: string[],
  /**
   * Guids to DBIDs mapping for each loaded model.
   */
  guidsAndModels: { model: Autodesk.Viewing.Model; guidsToDbids: { [key: string]: number } }[],
  /**
   * Whether to isolate the selected elements.
   */
  isolate?: boolean,
  /**
   * Whether to zoom to the selected elements.
   */
  zoom?: boolean,
) => {
  const aggregatedDbIds: { model: any; ids: number[] }[] = [];

  const allFragIds = [];

  guidsAndModels.forEach(({ model, guidsToDbids }) => {
    const dbIds = guids.map(guid => guidsToDbids[guid]).filter((el: number) => el);
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
  viewer.setAggregateSelection();
  //@ts-ignore
  isolate && viewer.setAggregateIsolation();
  viewer.setAggregateSelection(aggregatedDbIds);
  //@ts-ignore
  isolate && viewer.setAggregateIsolation(aggregatedDbIds);
  zoom &&
    viewer.fitToView(
      //@ts-ignore
      aggregatedDbIds.map(el => {
        return { model: el.model, selection: el.ids };
      }),
    );
};

export const loadModelByUrn = (
  /**
   * The URN of the model to load.
   */
  urn: string,
  /**
   * The viewer instance to use for loading the model.
   */
  viewer: Autodesk.Viewing.GuiViewer3D,
  /**
   * The viewable ID to load. If not provided, the default viewable will be loaded.
   * If skipped view priority: selectedView > Default View > New Construction > Default Geometry
   * Make sure Model has a proper view or provide that param
   */
  loadModelViewableId?: string,
  /**
   * Use a shared coordinate system for the model.
   */
  useSharedCoordinateSystem?: boolean,
  /**
   * Keep the current models in the viewer.
   */
  keepCurrentModels?: boolean,
  /**
   * Prevent a view from changing when loading a new model.
   */
  preserveView?: boolean,
) => {
  Autodesk.Viewing.Document.load(
    'urn:' + urn,
    async doc => {
      const root = doc.getRoot();
      const selectedView = root.findByGuid(loadModelViewableId || '');
      const defaultView = root.getNamedViews().find((v: any) => v.data.name === 'Default View');
      const newConstructionView = root.getNamedViews().find((v: any) => v.data.name === 'New Construction');
      const defaultModel = root.getDefaultGeometry();

      // Pick priority: selectedView > Default View > New Construction > Default Geometry
      const viewable = selectedView || defaultView || newConstructionView || defaultModel;

      const globalOffset = await getGlobalOffset(doc, viewer, viewable);

      await viewer.loadDocumentNode(doc, viewable, {
        preserveView: preserveView,
        applyRefPoint: !!useSharedCoordinateSystem,
        keepCurrentModels: !!keepCurrentModels,
        globalOffset: !!useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 },
      });
    },
    (code, message, errors) => console.error('LOAD MODEL ERROR', code, message, errors),
  );
};

export const unloadModelByUrn = (
  /**
   * The URN of the model to unload.
   */
  urn: string,
  /**
   * The viewer instance to use for unloading the model.
   */
  viewer: Autodesk.Viewing.GuiViewer3D,
  /**
   * Callback function to update the mapping of GUIDs to DBIDs.
   * @param urn - The URN of the model that was unloaded.
   * Inside this function you can update the mapping of GUIDs to DBIDs.
   * You have to filter the Mapping array and remove the unloaded model's GUIDs with its model.'
   */
  callbackToUpdatedMapping?: (urn: string) => void,
) => {
  const allLoadedModels = viewer.getAllModels();
  const modelToUnload = allLoadedModels.find(model => model.getData().urn === urn);
  viewer.unloadModel(modelToUnload);
  callbackToUpdatedMapping && callbackToUpdatedMapping(urn);
};
