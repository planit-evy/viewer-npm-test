// src/components/AutodeskViewer/AutodeskViewer.tsx
import { useEffect, useRef } from "react";
import { jsx } from "react/jsx-runtime";
var AutodeskViewer = ({ urn, accessToken, viewableId }) => {
  const containerRef = useRef(null);
  if (typeof window === "undefined") return null;
  useEffect(() => {
    if (typeof window === "undefined") return;
    let viewer;
    async function loadViewer() {
      await loadForgeViewer();
      const options = {
        env: "AutodeskProduction",
        accessToken
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
    loadViewer().then((r) => console.log("viewer loaded", r));
    return () => viewer == null ? void 0 : viewer.finish();
  }, [urn, accessToken]);
  return /* @__PURE__ */ jsx("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
};
async function loadForgeViewer() {
  if (window.Autodesk) return;
  const script = document.createElement("script");
  script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js";
  document.head.appendChild(script);
  const link = document.createElement("link");
  link.href = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  await new Promise((resolve) => {
    script.onload = resolve;
  });
}

// src/index.ts
var index_default = AutodeskViewer;
export {
  index_default as default
};
