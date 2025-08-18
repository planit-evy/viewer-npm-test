import * as react from 'react';
import { FC } from 'react';

type Props = {
    urn: string | string[];
    accessToken: string;
    viewableId?: string;
    useSharedCoordinateSystem?: boolean;
    mappingCallback?: (arg: any) => void;
    clearCallback?: () => void;
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

export { AutodeskViewer, _default as default, getAggregateSelection };
