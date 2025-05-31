import React, { useEffect, useRef } from 'react';

declare const Autodesk: any;

type Props = {
    urn: string;
    accessToken: string;
    viewableId?: string;
};

export const AutodeskViewer: React.FC<Props> = ({ urn, accessToken, viewableId }) => {
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
                Autodesk.Viewing.Document.load(documentId, (doc: any) => {
                    const defaultModel = doc.getRoot().getDefaultGeometry();
                    viewer.loadDocumentNode(doc, defaultModel);
                });
            });
        }

        loadViewer().then(r => console.log('viewer loaded', r));

        return () => viewer?.finish();
    }, [urn, accessToken]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
//test
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
