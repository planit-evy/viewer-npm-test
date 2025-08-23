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
  AutodeskViewer: () => AutodeskViewer,
  default: () => index_default,
  getAggregateSelection: () => getAggregateSelection,
  getObjectPropsByGuid: () => getObjectPropsByGuid,
  loadModelByUrn: () => loadModelByUrn,
  unloadModelByUrn: () => unloadModelByUrn
});
module.exports = __toCommonJS(index_exports);

// src/components/AutodeskViewer/AutodeskViewer.tsx
var import_react = require("react");

// src/heplers/viewerHelpers.ts
var getGlobalOffset = async (props) => {
  var _a;
  const bubbleNode = props.node ? props.node : props.doc.getRoot().getDefaultGeometry();
  await props.doc.downloadAecModelData();
  const aecModelData = bubbleNode.getAecModelData();
  const tf = aecModelData && aecModelData.refPointTransformation;
  let globalOffset = (_a = props.viewerInst.model) == null ? void 0 : _a.getData().globalOffset;
  const refPoint = tf ? new THREE.Vector3(tf[9], tf[10], tf[11]) : new THREE.Vector3(0, 0, 0);
  const MaxDistSqr = 4e6;
  const distSqr = globalOffset && THREE.Vector3.prototype.distanceToSquared.call(refPoint, globalOffset);
  if (!globalOffset || distSqr > MaxDistSqr) {
    globalOffset = new THREE.Vector3().copy(refPoint);
  }
  return globalOffset;
};
var getAggregateSelection = (props) => {
  const aggregatedDbIds = [];
  const allFragIds = [];
  props.guidsAndModels.forEach(({ model, guidsToDbids }) => {
    const dbIds = props.guids.map((guid) => guidsToDbids[guid]).filter((el) => el);
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
  props.viewer.setAggregateSelection();
  props.isolate && props.viewer.setAggregateIsolation();
  props.viewer.setAggregateSelection(aggregatedDbIds);
  props.isolate && viewer.setAggregateIsolation(aggregatedDbIds);
  props.zoom && props.viewer.fitToView(
    //@ts-ignore
    aggregatedDbIds.map((el) => {
      return { model: el.model, selection: el.ids };
    })
  );
};
var loadModelByUrn = (props) => {
  Autodesk.Viewing.Document.load(
    "urn:" + props.urn,
    async (doc) => {
      const root = doc.getRoot();
      const selectedView = root.findByGuid(props.loadModelViewableId || "");
      const defaultView = root.getNamedViews().find((v) => v.data.name === "Default View");
      const newConstructionView = root.getNamedViews().find((v) => v.data.name === "New Construction");
      const defaultModel = root.getDefaultGeometry();
      const viewable = selectedView || defaultView || newConstructionView || defaultModel;
      const globalOffset = await getGlobalOffset({ doc, viewerInst: props.viewer, node: viewable });
      await props.viewer.loadDocumentNode(doc, viewable, {
        preserveView: props.preserveView,
        applyRefPoint: !!props.useSharedCoordinateSystem,
        keepCurrentModels: !!props.keepCurrentModels,
        globalOffset: !!props.useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 }
      });
    },
    (code, message, errors) => console.error("LOAD MODEL ERROR", code, message, errors)
  );
};
var unloadModelByUrn = (props) => {
  const allLoadedModels = props.viewer.getAllModels();
  const modelToUnload = allLoadedModels.find((model) => model.getData().urn === props.urn);
  props.viewer.unloadModel(modelToUnload);
  props.callbackToUpdatedMapping && props.callbackToUpdatedMapping(props.urn);
};
var getObjectPropsByGuid = async (props) => {
  const mappingData = props.guidsAndModels.map((el) => {
    const { model, guidsToDbids } = el;
    const dbIds = props.guids.map((guid) => guidsToDbids[guid]);
    return new Promise((resolve, reject) => {
      model.getBulkProperties2(
        dbIds,
        {
          propFilter: props.propFilter,
          categoryFilter: props.categoryFilter,
          ignoreHidden: props.ignoreHidden,
          needExternalId: props.needExternalId
        },
        (properties) => {
          console.log("Found leaf dbids processed");
          resolve(properties);
        },
        (err) => {
          console.log("Mapping GUID to DBID error", err);
          reject(err);
        }
      );
    });
  });
  const result = await Promise.all(mappingData);
  return result.flat();
};

// src/components/AutodeskViewer/AutodeskViewer.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var AutodeskViewer = ({
  urn,
  accessToken,
  viewableId,
  useSharedCoordinateSystem,
  mappingCallback,
  clearCallback,
  viewerEnv = "AutodeskProduction2",
  viewerApi = "derivativeV2",
  theme = "light-theme",
  version = "7.111.0"
}) => {
  const containerRef = (0, import_react.useRef)(null);
  const viewerRef = (0, import_react.useRef)(null);
  const [modelAdded, setModelAdded] = (0, import_react.useState)("");
  const [modelLoaded, setModelLoaded] = (0, import_react.useState)(false);
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
  const onGeometryLoaded = (0, import_react.useCallback)((e) => {
    setModelLoaded(true);
  }, []);
  const onModelAdded = (0, import_react.useCallback)((e) => {
    setModelAdded(`${e.type}-${e.model.id}`);
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
          mappingCallback && mappingCallback(modelMapping);
        },
        (err) => {
          console.log("Mapping GUID to DBID error", err);
        }
      );
    });
  }, []);
  (0, import_react.useEffect)(() => {
    if (!viewerRef.current) {
      async function loadViewer() {
        await loadForgeViewer(version);
        const options = {
          env: viewerEnv,
          api: viewerApi,
          accessToken
        };
        const viewerOptions = {
          extensions: ["Autodesk.DocumentBrowser"],
          theme
        };
        Autodesk.Viewing.Initializer(options, () => {
          var _a, _b;
          (_a = window == null ? void 0 : window.NOP_VIEWER) == null ? void 0 : _a.finish();
          (_b = window == null ? void 0 : window.NOP_VIEWER) == null ? void 0 : _b.tearDown();
          viewerRef.current = new Autodesk.Viewing.GuiViewer3D(containerRef.current, viewerOptions);
          viewerRef.current.start();
          const urns = Array.isArray(urn) ? urn : [urn];
          const loadModelFromUrn = async (urn2, isFirst) => {
            const documentId = `urn:${urn2}`;
            Autodesk.Viewing.Document.load(
              documentId,
              async (doc) => {
                const root = doc.getRoot();
                const selectedView = root.findByGuid(viewableId);
                const defaultView = root.getNamedViews().find((v) => v.data.name === "Default View");
                const newConstructionView = root.getNamedViews().find((v) => v.data.name === "New Construction");
                const defaultModel = root.getDefaultGeometry();
                const viewable = selectedView || defaultView || newConstructionView || defaultModel;
                const globalOffset = await getGlobalOffset({ doc, viewerInst: viewerRef.current, node: viewable });
                await viewerRef.current.loadDocumentNode(doc, viewable, {
                  applyRefPoint: useSharedCoordinateSystem,
                  keepCurrentModels: !isFirst,
                  globalOffset: useSharedCoordinateSystem ? globalOffset : { x: 0, y: 0, z: 0 }
                });
              },
              (errCode, msg) => {
                console.error(`Failed to load document ${urn2}`, errCode, msg);
              }
            );
          };
          urns.forEach((u, idx) => loadModelFromUrn(u, idx === 0));
          viewerRef.current.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
          viewerRef.current.addEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
          viewerRef.current.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);
        });
      }
      loadViewer().then(() => console.log("VIEWER LOADED", viewerRef.current, window == null ? void 0 : window.NOP_VIEWERS));
    }
    return () => {
      var _a, _b, _c, _d, _e;
      (_a = viewerRef.current) == null ? void 0 : _a.tearDown();
      (_b = viewerRef.current) == null ? void 0 : _b.finish();
      (_c = viewerRef.current) == null ? void 0 : _c.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
      (_d = viewerRef.current) == null ? void 0 : _d.removeEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
      (_e = viewerRef.current) == null ? void 0 : _e.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);
      viewerRef.current = null;
      clearCallback && clearCallback();
    };
  }, [urn, accessToken, onGeometryLoaded, onModelAdded, onInstTreeCreated, clearCallback]);
  (0, import_react.useEffect)(() => {
    if (!modelLoaded) return;
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const _entry of entries) {
        (window == null ? void 0 : window.NOP_VIEWER) && window.NOP_VIEWER.resize();
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [modelLoaded, modelAdded]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
};
async function loadForgeViewer(version) {
  var _a;
  if ((_a = window.Autodesk) == null ? void 0 : _a.Viewing) return;
  if (document.getElementById("forge-viewer-script")) {
    await new Promise((resolve) => {
      document.getElementById("forge-viewer-script").onload = resolve;
    });
    return;
  }
  const script = document.createElement("script");
  script.id = "forge-viewer-script";
  script.src = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${version}/viewer3D.min.js`;
  document.head.appendChild(script);
  const link = document.createElement("link");
  link.href = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${version}/style.min.css`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
  await new Promise((resolve) => {
    script.onload = resolve;
  });
}

// src/index.ts
var index_default = {
  AutodeskViewer,
  getAggregateSelection,
  loadModelByUrn,
  unloadModelByUrn,
  getObjectPropsByGuid
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutodeskViewer,
  getAggregateSelection,
  getObjectPropsByGuid,
  loadModelByUrn,
  unloadModelByUrn
});
//# sourceMappingURL=index.js.map