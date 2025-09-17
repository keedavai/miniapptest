(function(){
  const qs=id=>document.getElementById(id);
  const title=qs('modeTitle');
  const desc=qs('modeDesc');
  const info=qs('info');
  const btn=qs('actionBtn');
  const year=qs('year');
  year.textContent=new Date().getFullYear();

  function isLandscape(){return window.innerWidth>window.innerHeight;}
  function isMobile(){return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);}

  function update(){
    const landscape=isLandscape();
    const mobile=isMobile();
    document.body.classList.toggle('landscape',landscape);
    document.body.classList.toggle('portrait',!landscape);
    document.body.classList.toggle('mobile',mobile);
    document.body.classList.toggle('desktop',!mobile);

    if(mobile){
      if(landscape){
        title.textContent='Mobile Landscape Mode';
        desc.textContent='Optimized wide layout. Rotate if you prefer vertical view.';
      } else {
        title.textContent='Mobile Portrait Mode';
        desc.textContent='Vertical fullscreen adaptive layout.';
      }
    } else {
      if(landscape){
        title.textContent='Desktop Landscape';
        desc.textContent='Fullscreen adaptive experience.';
      } else {
        title.textContent='Desktop Portrait';
        desc.textContent='Narrow viewport detected. Resize or rotate for wide layout.';
      }
    }

    info.innerHTML = `Viewport: ${window.innerWidth}×${window.innerHeight}<br>`+
      `Orientation: ${landscape?'landscape':'portrait'} · Device: ${mobile?'mobile':'desktop'}<br>`+
      `Pixel Ratio: ${window.devicePixelRatio}`;
  }

  function requestFS(){
    const el=document.documentElement;
    if(el.requestFullscreen){el.requestFullscreen().catch(()=>{});} else if(el.webkitRequestFullscreen){el.webkitRequestFullscreen();}
  }

  let clicked=false;
  btn.addEventListener('click',()=>{
    if(!clicked){
      btn.textContent='Hello Again!';
      clicked=true;
      requestFS();
    } else {
      alert('Hi there!');
    }
  });

  ['resize','orientationchange'].forEach(ev=>window.addEventListener(ev,()=>{
    // debounce updates
    clearTimeout(window.__updT);
    window.__updT=setTimeout(update,60);
  },{passive:true}));

  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) update(); });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',update);

  update();
  document.getElementById('app').classList.remove('loading');
})();