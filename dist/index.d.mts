import * as react from 'react';

declare const _default: {
    AutodeskViewer: react.FC<{
        urn: string | string[];
        accessToken: string;
        viewableId?: string;
        useSharedCoordinateSystem?: boolean;
        mappingCallback?: (arg: any) => void;
        clearCallback?: () => void;
    }>;
    getAggregateSelection: (viewer: Autodesk.Viewing.GuiViewer3D, guids: string[], guidsAndModels: {
        model: Autodesk.Viewing.Model;
        guidsToDbids: {
            [key: string]: number;
        };
    }[], isolate?: boolean) => void;
};

export { _default as default };
