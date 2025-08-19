var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
  AutodeskViewer: () => AutodeskViewer,
  default: () => index_default,
  getAggregateSelection: () => getAggregateSelection
});
module.exports = __toCommonJS(index_exports);

// src/components/AutodeskViewer/AutodeskViewer.tsx
var import_react = require("react");

// src/heplers/viewerHelpers.ts
var getGlobalOffset = async (doc, viewerInst, node) => {
  var _a;
  const bubbleNode = node ? node : doc.getRoot().getDefaultGeometry();
  await doc.downloadAecModelData();
  const aecModelData = bubbleNode.getAecModelData();
  const tf = aecModelData && aecModelData.refPointTransformation;
  let globalOffset = (_a = viewerInst.model) == null ? void 0 : _a.getData().globalOffset;
  const refPoint = tf ? new THREE.Vector3(tf[9], tf[10], tf[11]) : new THREE.Vector3(0, 0, 0);
  const MaxDistSqr = 4e6;
  const distSqr = globalOffset && THREE.Vector3.prototype.distanceToSquared.call(refPoint, globalOffset);
  if (!globalOffset || distSqr > MaxDistSqr) {
    globalOffset = new THREE.Vector3().copy(refPoint);
  }
  return globalOffset;
};
var getAggregateSelection = (viewer, guids, guidsAndModels, isolate) => {
  const aggregatedDbIds = [];
  const allFragIds = [];
  guidsAndModels.forEach(({ model, guidsToDbids }) => {
    const dbIds = guids.map((guid) => guidsToDbids[guid]).filter((el) => el);
    if (!dbIds.length) return;
    aggregatedDbIds.push({ model, ids: dbIds });
    dbIds == null ? void 0 : dbIds.forEach((id) => {
      model.getInstanceTree().enumNodeFragments(id, (fragId) => {
        allFragIds.push(fragId);
      });
    });
  });
  if (!allFragIds.length) {
    return;
  }
  viewer.setAggregateSelection();
  isolate && viewer.setAggregateIsolation();
  viewer.setAggregateSelection(aggregatedDbIds);
  isolate && viewer.setAggregateIsolation(aggregatedDbIds);
};

// src/components/AutodeskViewer/AutodeskViewer.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var runtime = {
  options: {},
  ready: null
};
async function initializeViewerRuntime(options) {
  if (!runtime.ready) {
    const script = document.createElement("script");
    script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.109.0/viewer3D.min.js";
    document.head.appendChild(script);
    const link = document.createElement("link");
    link.href = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.109.0/style.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    await new Promise((resolve) => {
      script.onload = resolve;
    });
    runtime.options = __spreadValues({}, options);
    runtime.ready = new Promise((resolve) => Autodesk.Viewing.Initializer(runtime.options, resolve));
  } else {
    if (
      // ['accessToken', 'getAccessToken', 'env', 'api', 'language']
      // Remove access token from the array because refresh from back returns every time a new token, and it leads to reject here
      ["getAccessToken", "env", "api", "language"].some((prop) => {
        return options[prop] !== runtime.options[prop];
      })
    ) {
      return Promise.reject("Cannot initialize another viewer runtime with different settings.");
    }
  }
  return runtime.ready;
}
var AutodeskViewer = ({
  urn,
  runtime: runtime2,
  viewableId,
  useSharedCoordinateSystem,
  mappingCallback,
  clearCallback,
  theme
}) => {
  const containerRef = (0, import_react.useRef)(null);
  const [viewer, setViewer] = (0, import_react.useState)(null);
  if (typeof window === "undefined") return null;
  const getAllLeafComponents = (viewer2, callback) => {
    let cbCount = 0;
    const components = [];
    let tree = viewer2.model.getData().instanceTree;
    function getLeafComponentsRec(parent) {
      cbCount++;
      if (tree.getChildCount(parent) != 0) {
        tree.enumNodeChildren(
          parent,
          function(children) {
            getLeafComponentsRec(children);
          },
          false
        );
      } else {
        components.push(parent);
      }
      if (--cbCount == 0) callback(components);
    }
    viewer2.getObjectTree(function(objectTree) {
      tree = objectTree;
      getLeafComponentsRec(tree.getRootId());
    });
  };
  const updateViewerState = (0, import_react.useCallback)(() => {
    if (!viewer || !(viewer == null ? void 0 : viewer.container)) return;
    const urns = Array.isArray(urn) ? urn : [urn];
    urns.forEach(
      (urn2, idx) => Autodesk.Viewing.Document.load(
        "urn:" + urn2,
        async (doc) => {
          await doc.downloadAecModelData();
          const root = doc.getRoot();
          const selectedView = root.findByGuid(viewableId);
          const defaultView = root.getNamedViews().find((v) => v.data.name === "Default View");
          const newConstructionView = root.getNamedViews().find((v) => v.data.name === "New Construction");
          const defaultModel = root.getDefaultGeometry();
          const viewable = selectedView || defaultView || newConstructionView || defaultModel;
          const globalOffset = await getGlobalOffset(doc, viewer, viewable);
          await viewer.loadDocumentNode(doc, viewable, {
            applyRefPoint: useSharedCoordinateSystem,
            keepCurrentModels: idx !== 0,
            globalOffset: useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 }
          });
        },
        (code, message, errors) => {
          console.error(code, message, errors);
        }
      )
    );
  }, [urn, viewableId, useSharedCoordinateSystem, viewer]);
  const onGeometryLoaded = (0, import_react.useCallback)((e) => {
    console.log("Geometry loaded", e);
  }, []);
  const onModelAdded = (0, import_react.useCallback)((e) => {
    console.log("Model added", e);
  }, []);
  const onInstTreeCreated = (0, import_react.useCallback)(async (e) => {
    getAllLeafComponents(e.target, function(dbIds) {
      console.log("Found " + dbIds.length + " leaf nodes");
      e.target.model.getBulkProperties2(
        dbIds,
        { propFilter: ["externalId"], categoryFilter: void 0, ignoreHidden: true, needExternalId: true },
        (arg) => {
          const dict = {};
          arg.forEach((el) => {
            if (el.externalId) {
              dict[el.externalId] = el.dbId;
            }
          });
          console.log("Found leaf dbids processed");
          const modelMapping = { model: e.model, guidsToDbids: dict };
          console.log({ model: e.model, guidsToDbids: dict });
          mappingCallback && mappingCallback(modelMapping);
        },
        (err) => {
          console.log("Mapping GUID to DBID error", err);
        }
      );
    });
  }, []);
  (0, import_react.useEffect)(() => {
    if (viewer) return;
    if (!containerRef.current) return;
    initializeViewerRuntime(runtime2 || {}).then(() => {
      const viewerInstance = containerRef.current && new Autodesk.Viewing.GuiViewer3D(containerRef.current, {
        theme: theme === "dark" ? "dark-theme" : "light-theme"
      });
      setViewer(viewerInstance);
    }).catch((err) => {
      console.error("viewer initialize error", err);
    });
  }, [viewer, containerRef]);
  (0, import_react.useEffect)(() => {
    if (!viewer || !(viewer == null ? void 0 : viewer.container)) return;
    viewer.start();
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
    viewer.addEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);
    updateViewerState();
    return () => {
      clearCallback && clearCallback();
      if (!viewer || !(viewer == null ? void 0 : viewer.container)) return;
      viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
      viewer.removeEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
      viewer.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);
      viewer.tearDown();
      viewer.finish();
    };
  }, [viewer, onGeometryLoaded, onModelAdded, onInstTreeCreated, updateViewerState]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
};

// src/index.ts
var index_default = {
  AutodeskViewer,
  getAggregateSelection
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutodeskViewer,
  getAggregateSelection
});
