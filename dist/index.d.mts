import * as react from 'react';
import { FC } from 'react';

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
declare const AutodeskViewer: FC<Props>;

declare const getAggregateSelection: (viewer: Autodesk.Viewing.GuiViewer3D, guids: string[], guidsAndModels: {
    model: Autodesk.Viewing.Model;
    guidsToDbids: {
        [key: string]: number;
    };
}[], isolate?: boolean) => void;

declare const _default: {
    AutodeskViewer: react.FC<{
        urn: string | string[];
        runtime: {
            accessToken: string;
            env: string;
            api: string;
        };
        viewableId?: string;
        useSharedCoordinateSystem?: boolean;
        mappingCallback?: (arg: any) => void;
        clearCallback?: () => void;
        theme?: "light" | "dark";
    }>;
    getAggregateSelection: (viewer: Autodesk.Viewing.GuiViewer3D, guids: string[], guidsAndModels: {
        model: Autodesk.Viewing.Model;
        guidsToDbids: {
            [key: string]: number;
        };
    }[], isolate?: boolean) => void;
};

export { AutodeskViewer, _default as default, getAggregateSelection };
