import{r as m}from"./iframe-DtzwXS3v.js";var c={exports:{}},d={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function y(){if(p)return d;p=1;var r=Symbol.for("react.transitional.element"),n=Symbol.for("react.fragment");function s(u,e,t){var o=null;if(t!==void 0&&(o=""+t),e.key!==void 0&&(o=""+e.key),"key"in e){t={};for(var i in e)i!=="key"&&(t[i]=e[i])}else t=e;return e=t.ref,{$$typeof:r,type:u,key:o,ref:e!==void 0?e:null,props:t}}return d.Fragment=n,d.jsx=s,d.jsxs=s,d}var f;function h(){return f||(f=1,c.exports=y()),c.exports}var T=h();const x=({urn:r,accessToken:n,viewableId:s})=>{const u=m.useRef(null);return typeof window>"u"?null:(m.useEffect(()=>{if(typeof window>"u")return;let e;async function t(){await V();const o={env:"AutodeskProduction",accessToken:n};Autodesk.Viewing.Initializer(o,()=>{e=new Autodesk.Viewing.GuiViewer3D(u.current),e.start();const i=`urn:${r}`;Autodesk.Viewing.Document.load(i,l=>{const R=l.getRoot().getDefaultGeometry();e.loadDocumentNode(l,R)})})}return t().then(o=>console.log("viewer loaded",o)),()=>e==null?void 0:e.finish()},[r,n]),T.jsx("div",{ref:u,style:{width:"100%",height:"100%"}}))};async function V(){if(window.Autodesk)return;const r=document.createElement("script");r.src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js",document.head.appendChild(r);const n=document.createElement("link");n.href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css",n.rel="stylesheet",document.head.appendChild(n),await new Promise(s=>{r.onload=s})}x.__docgenInfo={description:"",methods:[],displayName:"AutodeskViewer",props:{urn:{required:!0,tsType:{name:"string"},description:""},accessToken:{required:!0,tsType:{name:"string"},description:""},viewableId:{required:!1,tsType:{name:"string"},description:""}}};const A={title:"Components/AutodeskViewer",component:x,parameters:{layout:"fullscreen"}},a={args:{urn:"dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnRMT20wUTMxUmVpcWRXS3lsWUVfcHc_dmVyc2lvbj0yMA",accessToken:"token"}};var v,w,k;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    urn: 'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnRMT20wUTMxUmVpcWRXS3lsWUVfcHc_dmVyc2lvbj0yMA',
    accessToken: 'token'
  }
}`,...(k=(w=a.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};const _=["Default"];export{a as Default,_ as __namedExportsOrder,A as default};
