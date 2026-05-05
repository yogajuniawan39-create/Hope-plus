import React from 'react';

export default function Workspace({ 
  origImg, finalImg, compSlider, handleSliderMove, 
  canvasRef, compWrapRef, presets, activePreset, applyPreset,
  sliders, inkColors, inkColor, setInkColor, updateUser, user, setView, setOrigImg
}) {
  return (
    <div id="workspace" style={{ display: 'block' }}>
      <div className="ws-header">
        <div className="ws-title">YOUR STENCIL</div>
        <div className="ws-sub">Gunakan slider & preset untuk mengoptimalkan hasil stensil Anda.</div>
      </div>

      {/* PRESETS */}
      <div className="panel">
        <div className="panel-title">Quick Presets</div>
        <div className="presets-grid">
          {presets.map(p => (
            <div key={p} className={`preset-card ${activePreset === p ? 'active' : ''}`} onClick={() => applyPreset(p)}>
              <div className="preset-name" style={{marginTop:'6px'}}>{p.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDERS */}
      <div className="panel">
        <div className="panel-title">Thermal Matrix Controller</div>
        {sliders.map(s => (
          <div className="slider-group" key={s.label}>
            <div className="slider-header">
              <span className="slider-label">{s.label}</span>
              <div className="val-box">{s.displayVal}</div>
            </div>
            <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.onChange(e.target.value)} />
          </div>
        ))}
      </div>

      {/* COLORS */}
      <div className="panel">
        <div className="panel-title">Warna Tinta Stensil</div>
        <div className="swatches">
          {inkColors.map((c, i) => (
            <div key={i} className={`swatch ${inkColor.r === c.r ? 'active' : ''}`} style={{background: c.bg}} onClick={() => setInkColor(c)}></div>
          ))}
        </div>
      </div>

      {/* COMPARISON */}
      <div className="panel">
        <div className="panel-title"><span>Before / After</span></div>
        <div className="comparison-wrap" ref={compWrapRef} onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)} onTouchMove={handleSliderMove}>
          <canvas ref={canvasRef}></canvas>
          <img id="layer-original" src={origImg} alt="" style={{ clipPath: `polygon(0 0, ${compSlider}% 0, ${compSlider}% 100%, 0 100%)` }} />
          <div className="lbl lbl-l">Original</div><div className="lbl lbl-r">Stencil</div>
          <div id="div-line" style={{ left: `${compSlider}%` }}></div>
          <div id="div-handle" style={{ left: `${compSlider}%` }}>◂▸</div>
        </div>
      </div>

      {/* FINAL OUTPUT */}
      <div className="panel">
        <div className="panel-title">Final Output</div>
        <div className="final-box"><img id="final-img" src={finalImg} alt="Final" /></div>
        <a href={finalImg} download="HopePlus_Stencil.png" style={{textDecoration:'none'}}>
          <button className="btn btn-cyan" onClick={() => updateUser({downloads: (user?.downloads||0)+1})} style={{marginBottom:'10px'}}>
            ↓ DOWNLOAD STENCIL HD
          </button>
        </a>
        <button className="btn btn-ghost" onClick={() => { setOrigImg(''); setView('home'); }}>⟳ PROSES GAMBAR BARU</button>
      </div>
    </div>
  );
}
