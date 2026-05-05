import React, { useState, useEffect, useRef } from 'react';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import Paywall from './components/Paywall';
import Header from './components/Header';
import Workspace from './components/Workspace';
import { supabase } from './utils/supabase';
import { extractGray, bilateralFilter, unsharpMask, cannyEdge } from './utils/engine';

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [credits, setCredits] = useState(5);
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [procText, setProcText] = useState('PROCESSING...');
  const [view, setView] = useState('home');
  const [origImg, setOrigImg] = useState('');
  const [finalImg, setFinalImg] = useState('');
  const [compSlider, setCompSlider] = useState(50);
  const [detail, setDetail] = useState(3);
  const [contrast, setContrast] = useState(13);
  const [sharp, setSharp] = useState(10);
  const [activePreset, setActivePreset] = useState('dotwork');
  const [inkColor, setInkColor] = useState({ r: 26, g: 15, b: 92 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const compWrapRef = useRef(null);

  useEffect(() => {
    if (isSignedIn && user) loadOrCreateUser();
  }, [isSignedIn, user]);

  async function loadOrCreateUser() {
    const { data, error } = await supabase
      .from('users').select('*').eq('id', user.id).single();
    if (error || !data) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.firstName || user.username,
        credits: 5, used: 0, downloads: 0
      });
      setCredits(5);
    } else {
      setCredits(data.credits);
    }
  }

  async function updateUser(updates) {
    await supabase.from('users').update(updates).eq('id', user.id);
    if (updates.credits !== undefined) setCredits(updates.credits);
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast({ msg: '', type: '', show: false }), 2500);
  };

  const runPipeline = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.src) return;
    setIsProcessing(true);
    const ctx = canvas.getContext('2d');
    const MAX = 2048;
    let W = img.naturalWidth; let H = img.naturalHeight;
    if (W > MAX) { H = Math.round(H * MAX / W); W = MAX; }
    canvas.width = W; canvas.height = H;
    const rawGray = extractGray(img, W, H, contrast / 10.0);
    const smooth = bilateralFilter(rawGray, W, H, Math.min(4, detail * 0.18 + 0.8), 0.1);
    const enh = unsharpMask(smooth, W, H, 1.0, sharp / 10.0);
    const edges = cannyEdge(enh, W, H, 1.2, 0.3, 0.6);
    const out = ctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
      const p = i * 4;
      if (edges[i]) { out.data[p]=inkColor.r; out.data[p+1]=inkColor.g; out.data[p+2]=inkColor.b; out.data[p+3]=255; }
      else { out.data[p]=255; out.data[p+1]=255; out.data[p+2]=255; out.data[p+3]=255; }
    }
    ctx.putImageData(out, 0, 0);
    setFinalImg(canvas.toDataURL('image/png', 1.0));
    setIsProcessing(false);
  };

  if (!isLoaded) return null;

  return (
    <>
      <SignedOut><Paywall /></SignedOut>
      <SignedIn>
        <Header userCredits={credits} setModalBuy={() => {}} />
        <img ref={imgRef} src={origImg} style={{display:'none'}} alt="" crossOrigin="anonymous" onLoad={runPipeline} />
        <div id="proc-overlay" className={isProcessing ? 'show' : ''}>
          <div className="spinner"></div>
          <div className="proc-text">{procText}</div>
        </div>
        <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
        <div id="main-content">
          {view === 'home' ? (
            <div id="pre-upload-view">
              <div className="hero-section">
                <div className="hero-title">WELCOME, {user?.firstName}</div>
                <div className="hero-sub">Konversi gambar → stensil tato berkualitas studio</div>
              </div>
              <div className="upload-zone">
                <h3>Upload Desain</h3>
                <p>Ubah foto / sketsa menjadi stensil Thermal HD</p>
                <div className="btn btn-ghost" style={{pointerEvents:'none',maxWidth:'220px',margin:'0 auto'}}>📁 PILIH DARI GALERI</div>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { setOrigImg(ev.target.result); setView('workspace'); };
                    reader.readAsDataURL(file);
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
              presets={['outline','dotwork','heavy','fineline','neo','blackwork']}
              activePreset={activePreset} applyPreset={setActivePreset}
              sliders={[
                {label:'Ketebalan', val:detail, displayVal:detail, min:1, max:20, onChange:setDetail},
                {label:'Kontras', val:contrast, displayVal:(contrast/10).toFixed(1), min:8, max:30, onChange:setContrast},
              ]}
              inkColors={[{r:26,g:15,b:92,bg:'#1a0f5c'},{r:17,g:17,b:17,bg:'#111111'}]}
              inkColor={inkColor} setInkColor={setInkColor}
              updateUser={updateUser} user={user}
              setView={setView} setOrigImg={setOrigImg}
            />
          )}
        </div>
      </SignedIn>
    </>
  );
}