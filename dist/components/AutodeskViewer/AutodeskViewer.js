import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export const AutodeskViewer = ({ urn, accessToken, viewableId }) => {
    const containerRef = useRef(null);
    if (typeof window === 'undefined')
        return null;
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        let viewer;
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
                Autodesk.Viewing.Document.load(documentId, (doc) => {
                    const defaultModel = doc.getRoot().getDefaultGeometry();
                    viewer.loadDocumentNode(doc, defaultModel);
                });
            });
        }
        loadViewer().then(r => console.log('viewer loaded', r));
        return () => viewer === null || viewer === void 0 ? void 0 : viewer.finish();
    }, [urn, accessToken]);
    return _jsx("div", { ref: containerRef, style: { width: '100%', height: '100%' } });
};
//test
// Load viewer from local files
async function loadForgeViewer() {
    if (window.Autodesk)
        return;
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
