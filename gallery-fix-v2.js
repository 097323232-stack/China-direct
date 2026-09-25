(function(){
  "use strict";
  function parseImages(v){
    if(!v) return [];
    if(Array.isArray(v)) return v.filter(Boolean).slice(0,10);
    const s=String(v).trim();
    if(!s) return [];
    if(s.startsWith("[")){
      try{
        const a=JSON.parse(s);
        if(Array.isArray(a)) return a.filter(Boolean).slice(0,10);
      }catch(e){}
    }
    return [s];
  }
  function looksLikeJsonArray(s){
    s=String(s||"").trim();
    return s.startsWith("[") && s.endsWith("]");
  }
  function openGallery(images,startIndex){
    if(!images || !images.length) return;
    let index=Math.max(0,Math.min(startIndex||0,images.length-1));
    const old=document.getElementById("simaneliGalleryOverlay");
    if(old) old.remove();
    const overlay=document.createElement("div");
    overlay.id="simaneliGalleryOverlay";
    overlay.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:18px;";
    const close=document.createElement("button");
    close.type="button"; close.textContent="×";
    close.style.cssText="position:absolute;right:18px;top:18px;width:44px;height:44px;border:0;border-radius:50%;font-size:32px;background:#fff;color:#111;z-index:3;";
    const img=document.createElement("img");
    img.style.cssText="max-width:100%;max-height:78vh;object-fit:contain;border-radius:12px;";
    const counter=document.createElement("div");
    counter.style.cssText="position:absolute;bottom:22px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.14);color:#fff;padding:7px 12px;border-radius:999px;font:14px -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;";
    const prev=document.createElement("button");
    prev.type="button"; prev.textContent="‹";
    prev.style.cssText="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:46px;height:58px;border:0;border-radius:12px;font-size:42px;background:rgba(255,255,255,.15);color:#fff;";
    const next=document.createElement("button");
    next.type="button"; next.textContent="›";
    next.style.cssText="position:absolute;right:12px;top:50%;transform:translateY(-50%);width:46px;height:58px;border:0;border-radius:12px;font-size:42px;background:rgba(255,255,255,.15);color:#fff;";
    function render(){
      img.src=images[index];
      counter.textContent=(index+1)+" / "+images.length;
      const show=images.length>1?"block":"none";
      prev.style.display=show; next.style.display=show;
    }
    close.onclick=()=>overlay.remove();
    prev.onclick=(e)=>{e.stopPropagation();index=(index-1+images.length)%images.length;render();};
    next.onclick=(e)=>{e.stopPropagation();index=(index+1)%images.length;render();};
    overlay.onclick=(e)=>{if(e.target===overlay) overlay.remove();};
    let x0=null;
    overlay.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
    overlay.addEventListener("touchend",e=>{
      if(x0===null) return;
      const dx=e.changedTouches[0].clientX-x0;
      if(Math.abs(dx)>40 && images.length>1){
        index=dx<0?(index+1)%images.length:(index-1+images.length)%images.length;
        render();
      }
      x0=null;
    },{passive:true});
    overlay.append(close,img,prev,next,counter);
    document.body.appendChild(overlay);
    render();
  }
  function normalizeImage(img){
    if(!img || img.nodeType!==1 || img.tagName!=="IMG") return;
    if(img.dataset.simaneliGalleryReady==="1") return;
    const raw=img.getAttribute("src")||"";
    if(!looksLikeJsonArray(raw)) return;
    const images=parseImages(raw);
    if(!images.length) return;
    img.dataset.simaneliGalleryReady="1";
    img.src=images[0];
    if(images.length>1){
      img.style.cursor="pointer";
      img.addEventListener("click",function(ev){
        ev.preventDefault(); ev.stopPropagation(); openGallery(images,0);
      });
    }
  }
  let scanTimer=null;
  function scan(){
    clearTimeout(scanTimer);
    scanTimer=setTimeout(()=>{
      document.querySelectorAll("img:not([data-simaneli-gallery-ready='1'])").forEach(normalizeImage);
    },150);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",scan,{once:true});
  else scan();
  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.addedNodes && m.addedNodes.length)) scan();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(()=>observer.disconnect(),12000);
})();
