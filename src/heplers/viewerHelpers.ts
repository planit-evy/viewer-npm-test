//get global offset fot shared coordinate
export const getGlobalOffset = async (
    doc: Autodesk.Viewing.Document,
    viewerInst: Autodesk.Viewing.Viewer3D,
    node?: Autodesk.Viewing.BubbleNode,
) => {
    const bubbleNode = node ? node : doc.getRoot().getDefaultGeometry();
    await doc.downloadAecModelData();
    const aecModelData = bubbleNode.getAecModelData();
    const tf = aecModelData && aecModelData.refPointTransformation;

    let globalOffset = viewerInst.model?.getData().globalOffset;
    const refPoint = tf ? new THREE.Vector3(tf[9], tf[10], tf[11]) : new THREE.Vector3(0, 0, 0);

    // Check if the current globalOffset is close enough to the refPoint to avoid inaccuracies.
    const MaxDistSqr = 4.0e6;
    const distSqr = globalOffset && THREE.Vector3.prototype.distanceToSquared.call(refPoint, globalOffset);
    if (!globalOffset || distSqr > MaxDistSqr) {
        globalOffset = new THREE.Vector3().copy(refPoint);
    }
    return globalOffset;
};
