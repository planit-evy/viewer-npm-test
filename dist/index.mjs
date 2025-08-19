// src/components/AutodeskViewer/AutodeskViewer.tsx
import { useCallback, useEffect, useRef } from "react";

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
import { jsx } from "react/jsx-runtime";
var AutodeskViewer = ({ urn, accessToken, viewableId, useSharedCoordinateSystem, mappingCallback, clearCallback }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  if (typeof window === "undefined") return null;
  const getAllLeafComponents = (viewer, callback) => {
    let cbCount = 0;
    const components = [];
    let tree = viewer.model.getData().instanceTree;
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
    viewer.getObjectTree(function(objectTree) {
      tree = objectTree;
      getLeafComponentsRec(tree.getRootId());
    });
  };
  const onGeometryLoaded = useCallback((e) => {
    console.log("Geometry loaded", e);
  }, []);
  const onModelAdded = useCallback((e) => {
    console.log("Model added", e);
  }, []);
  const onInstTreeCreated = useCallback(async (e) => {
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
  useEffect(() => {
    if (typeof window === "undefined") return;
    async function loadViewer() {
      if (viewerRef.current) return;
      await loadForgeViewer();
      const options = {
        env: "AutodeskProduction",
        accessToken
      };
      Autodesk.Viewing.Initializer(options, () => {
        viewerRef.current = new Autodesk.Viewing.GuiViewer3D(containerRef.current);
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
              const globalOffset = await getGlobalOffset(doc, viewerRef.current, viewable);
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
    if (!viewerRef.current && containerRef.current) {
      loadViewer().then(() => console.log("viewer loaded"));
    }
    return () => {
      var _a, _b, _c, _d, _e;
      (_a = viewerRef.current) == null ? void 0 : _a.tearDown();
      (_b = viewerRef.current) == null ? void 0 : _b.finish();
      (_c = viewerRef.current) == null ? void 0 : _c.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
      (_d = viewerRef.current) == null ? void 0 : _d.removeEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, onModelAdded);
      (_e = viewerRef.current) == null ? void 0 : _e.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, onInstTreeCreated);
      clearCallback && clearCallback();
    };
  }, [urn, accessToken, onGeometryLoaded, onModelAdded, onInstTreeCreated, clearCallback]);
  return /* @__PURE__ */ jsx("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
};
async function loadForgeViewer() {
  if (window.Autodesk) return;
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
}

// src/index.ts
var index_default = {
  AutodeskViewer,
  getAggregateSelection
};
export {
  AutodeskViewer,
  index_default as default,
  getAggregateSelection
};
