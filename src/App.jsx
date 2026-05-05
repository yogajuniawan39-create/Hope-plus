import React, { useState, useEffect, useRef } from 'react';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import Header from './components/Header';
import Paywall from './components/Paywall';
import Workspace from './components/Workspace';
import { extractGray, gaussBlur, bilateralFilter, unsharpMask, cannyEdge, laplacianOfGaussian, dilate, morphClose, blueNoise } from './utils/engine';

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [credits, setCredits] = useState(5); // Default gratis 5
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const [modalBuy, setModalBuy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [procText, setProcText] = useState('PROCESSING...');
  const [view, setView] = useState('home'); 
  const [origImg, setOrigImg] = useState('');
  const [finalImg, setFinalImg] = useState('');
  const [compSlider, setCompSlider] = useState(50);
  
  // Slider states
  const [detail, setDetail] = useState(3);
  const [thresh, setThresh] = useState(120);
  const [shade, setShade] = useState(65);
  const [dot, setDot] = useState(12);
  const [contrast, setContrast] = useState(13);
  const [sharp, setSharp] = useState(10);
  const [activePreset, setActivePreset] = useState('dotwork');
  const [inkColor, setInkColor] = useState({ r: 26, g: 15, b: 92 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const compWrapRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast({ msg: '', type: '', show: false }), 2500);
  };

  const runPipeline = (fromSlider = false) => {
    const img = imgRef.current; const canvas = canvasRef.current;
    if (!img || !canvas || !img.src) return;
    setIsProcessing(true);
    if (!fromSlider) setProcText('INITIALIZING...');
    const MAX = 2048; let W = img.naturalWidth || img.width; let H = img.naturalHeight || img.height;
    if (W > MAX) { H = Math.round(H * MAX / W); W = MAX; canvas.width = W; canvas.height = H; }
    else { canvas.width = W; canvas.height = H; }

    const process = async () => {
      const ctx = canvas.getContext('2d');
      const rawGray = extractGray(img, W, H, contrast / 10.0);
      const smoothGray = bilateralFilter(rawGray, W, H, Math.min(4, Math.max(1.2, detail * 0.18 + 0.8)), 0.1);
      const enhGray = unsharpMask(smoothGray, W, H, 1.0, sharp / 10.0);
      const edgeS = cannyEdge(enhGray, W, H, 1.2, 0.3, 0.6);
      const outData = ctx.createImageData(W, H); const od = outData.data;
      
      for (let i = 0; i < W * H; i++) {
        const pi = i * 4;
        if (edgeS[i]) { od[pi]=inkColor.r; od[pi+1]=inkColor.g; od[pi+2]=inkColor.b; od[pi+3]=255; }
        else { od[pi]=255; od[pi+1]=255; od[pi+2]=255; od[pi+3]=255; }
      }
      ctx.putImageData(outData, 0, 0);
      setFinalImg(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
    process();
  };

  if (!isLoaded) return <div id="proc-overlay" className="show"><div className="spinner"></div></div>;

  return (
    <>
      <SignedOut>
        <Paywall />
      </SignedOut>

      <SignedIn>
        <Header userCredits={credits} setModalBuy={setModalBuy} />
        
        <img ref={imgRef} src={origImg} style={{ display: 'none' }} alt="source" crossOrigin="anonymous" />
        <div id="proc-overlay" className={isProcessing ? 'show' : ''}><div className="spinner"></div><div className="proc-text">{procText}</div></div>
        <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>

        <div id="main-content">
          {view === 'home' ? (
            <div id="pre-upload-view">
              <div className="hero-section"><div className="hero-title">WELCOME, {user?.firstName}</div></div>
              <div className="upload-zone">
                <h3>Mulai Stensil</h3>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setOrigImg(ev.target.result);
                    reader.readAsDataURL(file);
                    setView('workspace');
                  }
                }} />
              </div>
            </div>
          ) : (
            <Workspace 
              origImg={origImg} finalImg={finalImg} compSlider={compSlider} 
              handleSliderMove={(e) => {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const r = compWrapRef.current.getBoundingClientRect();
                setCompSlider(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
              }} 
              canvasRef={canvasRef} compWrapRef={compWrapRef}
              presets={['outline','dotwork','heavy']}
              activePreset={activePreset} applyPreset={(n) => setActivePreset(n)}
              sliders={[
                {label:'Ketebalan', val:detail, displayVal:detail, min:1, max:20, onChange:setDetail},
                {label:'Kontras', val:contrast, displayVal:(contrast/10).toFixed(1), min:8, max:30, onChange:setContrast},
              ]}
              inkColors={[{r:26,g:15,b:92, bg:'#1a0f5c'}, {r:17,g:17,b:17, bg:'#111111'}]}
              inkColor={inkColor} setInkColor={setInkColor} user={user} setView={setView} setOrigImg={setOrigImg}
            />
          )}
        </div>
      </SignedIn>
    </>
  );
}
