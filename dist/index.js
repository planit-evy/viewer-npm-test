var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/components/AutodeskViewer/AutodeskViewer.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var AutodeskViewer = ({ urn, accessToken, viewableId }) => {
  const containerRef = (0, import_react.useRef)(null);
  if (typeof window === "undefined") return null;
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
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
