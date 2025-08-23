import * as react from 'react';
import { FC } from 'react';

interface ISelection {
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
    guidsAndModels: {
        model: Autodesk.Viewing.Model;
        guidsToDbids: {
            [key: string]: number;
        };
    }[];
    /**
     * Whether to isolate the selected elements.
     */
    isolate?: boolean;
    /**
     * Whether to zoom to the selected elements.
     */
    zoom?: boolean;
}
interface ILoadModel {
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
interface IUnloadModel {
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
interface IGetProps {
    /**
     * Guids to DBIDs mapping for each loaded model.
     */
    guidsAndModels: {
        model: Autodesk.Viewing.Model;
        guidsToDbids: {
            [key: string]: number;
        };
    }[];
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
declare const AutodeskViewer: FC<Props>;

declare const getAggregateSelection: (props: ISelection) => void;
declare const loadModelByUrn: (props: ILoadModel) => void;
declare const unloadModelByUrn: (props: IUnloadModel) => void;
declare const getObjectPropsByGuid: (props: IGetProps) => Promise<any>;

declare const _default: {
    AutodeskViewer: react.FC<{
        urn: string | string[];
        accessToken: string;
        viewableId?: string;
        useSharedCoordinateSystem?: boolean;
        mappingCallback?: (arg: any) => void;
        clearCallback?: () => void;
        viewerEnv?: "AutodeskProduction" | "AutodeskProduction2";
        viewerApi?: "streamingV2" | "derivativeV2";
        theme?: "light-theme" | "dark-theme";
        version?: string;
    }>;
    getAggregateSelection: (props: ISelection) => void;
    loadModelByUrn: (props: ILoadModel) => void;
    unloadModelByUrn: (props: IUnloadModel) => void;
    getObjectPropsByGuid: (props: IGetProps) => Promise<any>;
};

export { AutodeskViewer, _default as default, getAggregateSelection, getObjectPropsByGuid, loadModelByUrn, unloadModelByUrn };
