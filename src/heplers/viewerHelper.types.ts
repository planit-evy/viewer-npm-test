export interface IGlobalOffest {
  doc: Autodesk.Viewing.Document;
  viewerInst: Autodesk.Viewing.Viewer3D;
  node?: Autodesk.Viewing.BubbleNode;
}

export interface ISelection {
  /**
   * The viewer instance to use for setting the aggregate selection.
   */
  viewer: Autodesk.Viewing.GuiViewer3D;
  /**
   * The GUIDs array to select or isolate.
   */
  guids: string[];
  /**
   * Guids to DBIDs mapping for each loaded model.
   */
  guidsAndModels: { model: Autodesk.Viewing.Model; guidsToDbids: { [key: string]: number } }[];
  /**
   * Whether to isolate the selected elements.
   */
  isolate?: boolean;
  /**
   * Whether to zoom to the selected elements.
   */
  zoom?: boolean;
}

export interface ILoadModel {
  /**
   * The URN of the model to load.
   */
  urn: string;
  /**
   * The viewer instance to use for loading the model.
   */
  viewer: Autodesk.Viewing.GuiViewer3D;
  /**
   * The viewable ID to load. If not provided, the default viewable will be loaded.
   * If skipped view priority: selectedView > Default View > New Construction > Default Geometry
   * Make sure Model has a proper view or provide that param
   */
  loadModelViewableId?: string;
  /**
   * Use a shared coordinate system for the model.
   */
  useSharedCoordinateSystem?: boolean;
  /**
   * Keep the current models in the viewer.
   */
  keepCurrentModels?: boolean;
  /**
   * Prevent a view from changing when loading a new model.
   */
  preserveView?: boolean;
}

export interface IUnloadModel {
  /**
   * The URN of the model to unload.
   */
  urn: string;
  /**
   * The viewer instance to use for unloading the model.
   */
  viewer: Autodesk.Viewing.GuiViewer3D;
  /**
   * Callback function to update the mapping of GUIDs to DBIDs.
   * @param urn - The URN of the model that was unloaded.
   * Inside this function you can update the mapping of GUIDs to DBIDs.
   * You have to filter the Mapping array and remove the unloaded model's GUIDs with its model.'
   */
  callbackToUpdatedMapping?: (urn: string) => void;
}

export interface IGetProps {
  /**
   * Guids to DBIDs mapping for each loaded model.
   */
  guidsAndModels: { model: Autodesk.Viewing.Model; guidsToDbids: { [key: string]: number } }[];
  /**
   * The GUIDs array to get props.
   */
  guids: string[];
  /**
   * The prop filter to use for getting props.
   */
  propFilter?: string[];
  /**
   * The category filter to use for getting props.
   */
  categoryFilter?: string[];
  /**
   * Ignore hidden nodes (elements).
   */
  ignoreHidden?: boolean;
  /**
   * Need external id in props or not.
   */
  needExternalId?: boolean;
}
