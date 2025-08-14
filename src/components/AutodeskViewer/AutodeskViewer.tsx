import React, { useEffect, useRef } from 'react';
import {getGlobalOffset} from "../../heplers/viewerHelpers";

declare const Autodesk: any;

type Props = {
    urn: string;
    accessToken: string;
    viewableId?: string;
    useSharedCoordinateSystem?: boolean;
};

export const AutodeskViewer: React.FC<Props> = ({ urn, accessToken, viewableId, useSharedCoordinateSystem }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    if (typeof window === 'undefined') return null;
    useEffect(() => {
        if (typeof window === 'undefined') return
        let viewer: any;

        async function loadViewer() {
            await loadForgeViewer();

            const options = {
                env: 'AutodeskProduction',
                accessToken,
            };

            Autodesk.Viewing.Initializer(options, () => {
                viewer = new Autodesk.Viewing.GuiViewer3D(containerRef.current);
                viewer.start();

                const documentId = `urn:${urn}`;
                Autodesk.Viewing.Document.load(documentId, async (doc: any) => {

                    const defaultView = doc
                        .getRoot()
                        .getNamedViews()
                        .find((view: any) => view.data.name === 'Default View');
                    const newConstructionView = doc
                        .getRoot()
                        .getNamedViews()
                        .find((view: any) => view.data.name === 'New Construction');
                    const defaultModel = doc.getRoot().getDefaultGeometry();

                    const globalOffset = await getGlobalOffset(doc, viewer, defaultView || newConstructionView || defaultModel);

                    await viewer.loadDocumentNode(doc, defaultView || newConstructionView || defaultModel, {
                        applyRefPoint: useSharedCoordinateSystem,
                        keepCurrentModels: true,
                        globalOffset: useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 },
                    } );
                });
            });
        }

        loadViewer().then(r => console.log('viewer loaded', r));

        return () => viewer?.finish();
    }, [urn, accessToken]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

// Load viewer from local files
async function loadForgeViewer() {
    if ((window as any).Autodesk) return;

    const script = document.createElement('script');
    // script.src = '/viewer3D.min.js';
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
    document.head.appendChild(script);

    const link = document.createElement('link');
    // link.href = '/style.min.css';
    link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    await new Promise((resolve) => {
        script.onload = resolve;
    });
}
