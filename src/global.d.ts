// Extend the global Window interface
declare global {
  interface Window {
    Autodesk: typeof import('@types/forge-viewer');
    THREE: typeof import('three');
    NOP_VIEWER?: Autodesk.Viewing.GuiViewer3D;
  }

  // Allow direct usage without a window.
  const Autodesk: typeof import('@types/forge-viewer');
  const THREE: typeof import('three');
}

export {};
