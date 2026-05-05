import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Paywall from './components/Paywall';
import Workspace from './components/Workspace';
import {
  extractGray, gaussBlur, bilateralFilter, unsharpMask,
  cannyEdge, laplacianOfGaussian, dilate, morphClose, blueNoise
} from './utils/engine';

export default function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const [modalBuy, setModalBuy] = useState(false);
  const [modalAcc, setModalAcc] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [procText, setProcText] = useState('PROCESSING...');
  const [view, setView] = useState('home'); 
  const [origImg, setOrigImg] = useState('');
  const [finalImg, setFinalImg] = useState('');
  const [compSlider, setCompSlider] = useState(50);
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

  const getDB = () => JSON.parse(localStorage.getItem('hopeplus_users')) || {};
  const saveDB = (db) => localStorage.setItem('hopeplus_users', JSON.stringify(db));

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('hopeplus_session'));
    if (session) {
      const db = getDB();
      if (db[session.username]) setUser(db[session.username]);
    }
  }, []);

  const updateUser = (data) => {
    if (!user) return;
    const db = getDB();
    const updated = { ...db[user.username], ...data };
    db[user.username] = updated;
    saveDB(db);
    setUser(updated);
  };

  const useCredit = () => {
    if (!user) return false;
    if (user.credits <= 0) {
      setModalBuy(true);
      showToast('Kredit habis! Silakan beli kredit.', 'error');
      return false;
    }
    updateUser({ credits: user.credits - 1, used: (user.used || 0) + 1 });
    return true;
  };

  // --- AUTH LOGIC ---
  const doRegister = () => {
    const u = document.getElementById('reg-user').value.trim();
    const e = document.getElementById('reg-email').value.trim();
    const p = document.getElementById('reg-pass').value;
    if (u.length < 3 || !e.includes('@') || p.length < 6) return alert('Data tidak valid.');
    const db = getDB();
    if (db[u]) return alert('Username sudah digunakan.');
    const newUser = { username: u, email: e, pass: p, credits: 5, used: 0, downloads: 0 };
    db[u] = newUser; saveDB(db);
    localStorage.setItem('hopeplus_session', JSON.stringify({ username: u }));
    setUser(newUser); showToast('Akun dibuat!', 'success');
  };

  const doLogin = () => {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    const db = getDB();
    if (!db[u] || db[u].pass !== p) return alert('Username/Password salah.');
    localStorage.setItem('hopeplus_session', JSON.stringify({ username: u }));
    setUser(db[u]); showToast('Selamat datang!', 'success');
  };

  const doLicense = () => {
    const code = document.getElementById('license-input').value.trim().toUpperCase();
    if (code === 'LUNAS2026' || code === 'ADMIN') {
      const db = getDB();
      if (!db['admin']) db['admin'] = { username: 'admin', email: 'admin@hopeplus.id', pass: '', credits: 9999, used: 0, downloads: 0 };
      saveDB(db); localStorage.setItem('hopeplus_session', JSON.stringify({ username: 'admin' }));
      setUser(db['admin']); showToast('Admin Mode!', 'success');
    }
  };

  const doLogout = () => {
    localStorage.removeItem('hopeplus_session');
    setUser(null); setView('home'); setModalAcc(false);
    showToast('Berhasil keluar.', 'warn');
  };

  // --- ENGINE & HANDLERS ---
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !useCredit()) return;
    setIsProcessing(true); setProcText('MEMUAT GAMBAR...');
    const reader = new FileReader();
    reader.onload = (ev) => setOrigImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAiGen = async () => {
    if (!useCredit()) return;
    const prompt = document.getElementById('ai-prompt').value.trim();
    if (!prompt) return showToast('Ketik dulu ide tato kamu!', 'warn');
    setIsProcessing(true); setProcText('AI GENERATING...');
    try {
      const fd = new FormData();
      fd.append('prompt', prompt + ', tattoo stencil, fine line art, professional design, white background');
      fd.append('output_format', 'png');
      const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
        method: 'POST',
        headers: { 'Authorization': `Bearer sk-2kDBGxQGfmesSOFWdYfvr3uBwydiZZw3MiUpGds18PZcs7sM`, 'Accept': 'image/*' },
        body: fd
      });
      if (resp.ok) {
        const blob = await resp.blob(); setOrigImg(URL.createObjectURL(blob));
      } else { throw new Error(); }
    } catch {
      showToast('AI error.', 'error'); 
      updateUser({ credits: user.credits + 1, used: Math.max(0, user.used - 1) });
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!origImg || !imgRef.current) return;
    imgRef.current.onload = () => { if (view === 'home') setView('workspace'); runPipeline(); };
  }, [origImg]);

  useEffect(() => {
    if (view === 'workspace' && origImg) {
      const t = setTimeout(() => runPipeline(true), 350);
      return () => clearTimeout(t);
    }
  }, [detail, thresh, shade, dot, contrast, sharp, inkColor]);

  const runPipeline = (fromSlider = false) => {
    const img = imgRef.current; const canvas = canvasRef.current;
    if (!img || !canvas || !img.src) return;
    setIsProcessing(true);
    if (!fromSlider) setProcText('INITIALIZING...');
    const MAX = 2048; let W = img.naturalWidth || img.width; let H = img.naturalHeight || img.height;
    if (W > MAX) { H = Math.round(H * MAX / W); W = MAX; }
    canvas.width = W; canvas.height = H;

    const yieldThread = (msg) => new Promise(r => { if (!fromSlider) setProcText(msg); setTimeout(r, 20); });

    const process = async () => {
      const ctx = canvas.getContext('2d');
      const cV = contrast / 10.0; const sD = shade / 100.0; const dSz = dot / 10.0; const shV = sharp / 10.0;
      const bilSigmaS = Math.min(4, Math.max(1.2, detail * 0.18 + 0.8));
      const bilSigmaR = 0.09 + (1 - thresh / 240) * 0.08;
      const umSigma = Math.max(0.8, detail * 0.2); const umAmount = shV * 0.9;
      const normT = thresh / 240.0;
      const hi1 = 0.28 + normT * 0.32; const lo1 = hi1 * 0.45;
      const loGThresh = 0.35 + normT * 0.20;
      const sig1 = Math.max(1.2, detail * 0.22 + 0.8);
      const dilR1 = Math.max(1.0, detail * 0.22);

      await yieldThread('PROCESSING GRAYSCALE...');
      const rawGray = extractGray(img, W, H, cV);
      await yieldThread('APPLYING FILTERS...');
      const smoothGray = bilateralFilter(rawGray, W, H, bilSigmaS, bilSigmaR);
      const enhGray = unsharpMask(smoothGray, W, H, umSigma, umAmount);
      await yieldThread('DETECTING EDGES...');
      let edgeS = cannyEdge(enhGray, W, H, sig1, lo1, hi1);
      edgeS = dilate(edgeS, W, H, dilR1);
      const edgeLoG = laplacianOfGaussian(rawGray, W, H, 0.7, loGThresh);
      const composite = new Uint8Array(W * H);
      for (let i = 0; i < composite.length; i++) composite[i] = edgeS[i] | edgeLoG[i];
      const closedEdge = morphClose(composite, W, H, 1.5);
      const shadeGray = gaussBlur(smoothGray, W, H, Math.max(0.8, detail * 0.25));

      await yieldThread('RENDERING STENCIL...');
      const outData = ctx.createImageData(W, H); const od = outData.data;
      const shadeMin = Math.max(0, 1.0 - sD * 1.05);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x; const pi = i * 4;
          const isEdge = closedEdge[i] === 1;
          const prob = Math.max(0, Math.min(1, ((1.0 - shadeGray[i]) - shadeMin) / (1.0 - shadeMin + 1e-6)));
          const isDot = blueNoise(x, y) < (prob * dSz * 0.52);
          if (isEdge || isDot) { od[pi]=inkColor.r; od[pi+1]=inkColor.g; od[pi+2]=inkColor.b; od[pi+3]=255; }
          else { od[pi]=255; od[pi+1]=255; od[pi+2]=255; od[pi+3]=255; }
        }
      }
      ctx.putImageData(outData, 0, 0);
      setFinalImg(canvas.toDataURL('image/png', 1.0));
      if (!fromSlider) showToast('Stensil selesai!', 'success');
      setIsProcessing(false);
    };
    process();
  };

  const handleSliderMove = (e) => {
    if (!compWrapRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const r = compWrapRef.current.getBoundingClientRect();
    setCompSlider(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <>
      <img ref={imgRef} src={origImg} style={{ display: 'none' }} alt="source" crossOrigin="anonymous" />
      <div id="proc-overlay" className={isProcessing ? 'show' : ''}><div className="spinner"></div><div className="proc-text">{procText}</div></div>
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>

      {!user && <Paywall doLogin={doLogin} doRegister={doRegister} doLicense={doLicense} />}
      <Header user={user} setModalBuy={setModalBuy} setModalAcc={setModalAcc} />

      <div id="main-content">
        {view === 'home' ? (
          <div id="pre-upload-view">
            <div className="hero-section"><div className="hero-title">STENCIL ENGINE<br/>NEXT GEN</div><div className="hero-sub">Studio Quality Stencils.</div></div>
            <div className="ai-section">
              <div className="ai-section-title">✦ AI TATTOO GENERATOR</div>
              <textarea id="ai-prompt" rows="3" placeholder="Contoh: Dragon portrait..."></textarea>
              <button className="btn btn-cyan" onClick={handleAiGen}>⚡ GENERATE AI</button>
            </div>
            <div className="upload-zone">
              <h3>Upload Desain</h3>
              <div className="btn btn-ghost" style={{pointerEvents:'none', maxWidth:'220px', margin:'10px auto'}}>📁 PILIH GAMBAR</div>
              <input type="file" accept="image/*" onChange={handleUpload} />
            </div>
          </div>
        ) : (
          <Workspace 
            origImg={origImg} finalImg={finalImg} compSlider={compSlider} 
            handleSliderMove={handleSliderMove} canvasRef={canvasRef} compWrapRef={compWrapRef}
            presets={['outline','dotwork','heavy','fineline','neo','blackwork']}
            activePreset={activePreset} applyPreset={(name) => {
              setActivePreset(name);
              const p = {outline:{d:2,t:90,s:0,dot:8,c:14,sh:10},dotwork:{d:3,t:120,s:65,dot:12,c:13,sh:10},heavy:{d:8,t:160,s:85,dot:18,c:16,sh:14},fineline:{d:1,t:88,s:35,dot:8,c:16,sh:16},neo:{d:4,t:130,s:72,dot:15,c:14,sh:11},blackwork:{d:10,t:180,s:95,dot:22,c:18,sh:14}}[name];
              setDetail(p.d); setThresh(p.t); setShade(p.s); setDot(p.dot); setContrast(p.c); setSharp(p.sh);
            }}
            sliders={[
              {label:'Ketebalan', val:detail, displayVal:detail, min:1, max:20, onChange:setDetail},
              {label:'Ambang Batas', val:thresh, displayVal:thresh, min:40, max:240, onChange:setThresh},
              {label:'Shading', val:shade, displayVal:shade, min:0, max:100, onChange:setShade},
              {label:'Ukuran Dot', val:dot, displayVal:(dot/10).toFixed(1), min:5, max:35, onChange:setDot},
              {label:'Kontras', val:contrast, displayVal:(contrast/10).toFixed(1), min:8, max:30, onChange:setContrast},
              {label:'Sharpen', val:sharp, displayVal:(sharp/10).toFixed(1), min:5, max:25, onChange:setSharp},
            ]}
            inkColors={[
              {r:26,g:15,b:92, bg:'#1a0f5c'}, {r:10,g:26,b:61, bg:'#0a1a3d'}, 
              {r:17,g:17,b:17, bg:'#111111'}, {r:61,g:10,b:10, bg:'#3d0a0a'}
            ]}
            inkColor={inkColor} setInkColor={setInkColor} updateUser={updateUser} user={user} setView={setView} setOrigImg={setOrigImg}
          />
        )}
      </div>

      {modalBuy && (
        <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && setModalBuy(false)}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setModalBuy(false)}>✕</button>
            <div className="modal-title">BELI KREDIT</div>
            <button className="btn btn-gold" onClick={() => { setModalBuy(false); showToast('Hubungi Admin!', 'warn'); }}>✓ KONFIRMASI</button>
          </div>
        </div>
      )}

      {modalAcc && (
        <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && setModalAcc(false)}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setModalAcc(false)}>✕</button>
            <div className="modal-title">AKUN SAYA</div>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-num">{user?.credits}</div><div className="stat-lbl">Kredit</div></div>
            </div>
            <button className="btn btn-danger" onClick={doLogout}>⏻ KELUAR</button>
          </div>
        </div>
      )}
    </>
  );
}
