import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

  .hp-root {
    --ink: #050810;
    --deep: #080d1a;
    --panel: #0c1428;
    --border: rgba(0,200,255,0.15);
    --cyan: #00d4ff;
    --cyan-dim: rgba(0,212,255,0.6);
    --gold: #f0a500;
    --white: #e8f4ff;
    --muted: rgba(200,220,255,0.45);
    --danger: #ff3860;
    --success: #00ffaa;
    font-family: 'Rajdhani', sans-serif;
    background-color: var(--ink);
    color: var(--white);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  /* Grid background */
  .hp-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,180,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,180,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* Scanlines */
  .hp-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px);
    pointer-events: none;
    z-index: 0;
  }

  .hp-app {
    position: relative;
    z-index: 1;
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-bottom: 100px;
  }

  /* Ambient */
  .hp-ambient-1, .hp-ambient-2 {
    position: fixed;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  .hp-ambient-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,150,255,0.12), transparent 70%);
    top: -100px; left: -100px;
    animation: hpDrift1 12s ease-in-out infinite;
  }
  .hp-ambient-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(240,165,0,0.07), transparent 70%);
    bottom: 0; right: -80px;
    animation: hpDrift2 15s ease-in-out infinite;
  }

  /* NAV */
  .hp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(8,13,26,0.95), transparent);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .hp-nav-logo { display: flex; align-items: center; gap: 10px; }
  .hp-logo-icon {
    width: 38px; height: 38px;
    border: 1.5px solid var(--cyan);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,212,255,0.06);
    box-shadow: 0 0 20px rgba(0,212,255,0.2), inset 0 0 10px rgba(0,212,255,0.05);
    color: var(--cyan);
    font-size: 18px;
  }
  .hp-logo-text {
    font-family: 'Orbitron', monospace;
    font-size: 13px; font-weight: 700;
    letter-spacing: 1px; color: var(--white);
  }
  .hp-logo-text span { color: var(--cyan); }
  .hp-nav-right { display: flex; align-items: center; gap: 10px; }
  .hp-credit-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    background: rgba(240,165,0,0.08);
    border: 1px solid rgba(240,165,0,0.3);
    border-radius: 20px;
    font-family: 'Orbitron', monospace;
    font-size: 11px; font-weight: 700;
    color: var(--gold); letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .hp-credit-pill:hover {
    background: rgba(240,165,0,0.15);
    box-shadow: 0 0 15px rgba(240,165,0,0.2);
  }
  .hp-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--cyan), #0055aa);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Orbitron', monospace;
    font-size: 14px; font-weight: 700; color: white;
    cursor: pointer;
    border: 1.5px solid rgba(0,212,255,0.4);
    box-shadow: 0 0 15px rgba(0,212,255,0.2);
  }

  /* HERO */
  .hp-hero {
    padding: 36px 24px 28px;
    text-align: center;
    animation: hpFadeUp 0.6s 0.1s both;
  }
  .hp-hero-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 3px;
    color: var(--cyan-dim); text-transform: uppercase;
    margin-bottom: 16px;
    padding: 5px 14px;
    border: 1px solid rgba(0,212,255,0.2);
    border-radius: 20px;
    background: rgba(0,212,255,0.04);
  }
  .hp-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
    animation: hpPulse 2s infinite;
    display: inline-block;
  }
  .hp-greeting {
    font-size: 13px; font-weight: 400;
    color: var(--muted); letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 6px;
  }
  .hp-title {
    font-family: 'Orbitron', monospace;
    font-size: 30px; font-weight: 900; line-height: 1.1;
    color: var(--white);
    text-shadow: 0 0 40px rgba(0,212,255,0.3);
    margin-bottom: 4px;
  }
  .hp-title .hl { color: var(--cyan); text-shadow: 0 0 30px rgba(0,212,255,0.6); }
  .hp-sub {
    font-size: 13px; color: var(--muted);
    letter-spacing: 1px; font-weight: 300; margin-top: 10px;
  }

  /* STATS */
  .hp-stats {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 8px; padding: 0 20px 28px;
    animation: hpFadeUp 0.6s 0.2s both;
  }
  .hp-stat {
    background: var(--panel);
    border: 1px solid var(--border);
    border-top: 2px solid rgba(0,212,255,0.4);
    border-radius: 12px;
    padding: 14px 10px; text-align: center;
    cursor: pointer; transition: all 0.25s;
  }
  .hp-stat:hover {
    border-color: rgba(0,212,255,0.35);
    background: rgba(0,212,255,0.05);
    transform: translateY(-2px);
  }
  .hp-stat-val {
    font-family: 'Orbitron', monospace;
    font-size: 22px; font-weight: 700;
    color: var(--cyan); display: block;
    text-shadow: 0 0 20px rgba(0,212,255,0.5);
  }
  .hp-stat-val.gold { color: var(--gold); text-shadow: 0 0 20px rgba(240,165,0,0.5); }
  .hp-stat-val.green { color: var(--success); text-shadow: 0 0 20px rgba(0,255,170,0.4); }
  .hp-stat-lbl {
    font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
    font-family: 'Share Tech Mono', monospace;
    margin-top: 4px; display: block;
  }

  /* SECTION TITLE */
  .hp-section-title {
    font-family: 'Orbitron', monospace;
    font-size: 10px; font-weight: 600;
    letter-spacing: 3px; color: var(--cyan-dim);
    text-transform: uppercase;
    padding: 0 20px 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .hp-section-title::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, var(--border), transparent);
  }

  /* UPLOAD ZONE */
  .hp-upload {
    margin: 0 20px 28px;
    border: 2px dashed rgba(0,212,255,0.2);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(0,212,255,0.03), rgba(0,50,100,0.08));
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    animation: hpFadeUp 0.6s 0.3s both;
  }
  .hp-upload:hover {
    border-color: rgba(0,212,255,0.5);
    background: rgba(0,212,255,0.06);
    transform: scale(1.01);
    box-shadow: 0 0 40px rgba(0,212,255,0.1);
  }
  .hp-upload-icon {
    width: 72px; height: 72px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.12), transparent);
    border: 1px solid rgba(0,212,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    animation: hpFloat 3s ease-in-out infinite;
    position: relative;
  }
  .hp-upload-title {
    font-family: 'Orbitron', monospace;
    font-size: 15px; font-weight: 700;
    color: var(--white); margin-bottom: 8px; letter-spacing: 1px;
  }
  .hp-upload-desc {
    font-size: 13px; color: var(--muted);
    line-height: 1.6; margin-bottom: 24px;
  }
  .hp-upload-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 13px 32px;
    background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,100,200,0.1));
    border: 1.5px solid rgba(0,212,255,0.5);
    border-radius: 50px;
    font-family: 'Orbitron', monospace;
    font-size: 12px; font-weight: 600;
    letter-spacing: 2px; color: var(--cyan);
    cursor: pointer; transition: all 0.25s;
    text-transform: uppercase;
  }
  .hp-upload-btn:hover {
    border-color: var(--cyan); color: white;
    box-shadow: 0 0 30px rgba(0,212,255,0.3);
    transform: translateY(-1px);
  }
  .hp-formats {
    margin-top: 16px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; color: rgba(200,220,255,0.25); letter-spacing: 1px;
  }

  /* TOOLS GRID */
  .hp-tools {
    display: grid; grid-template-columns: repeat(2,1fr);
    gap: 10px; padding: 0 20px 28px;
    animation: hpFadeUp 0.6s 0.4s both;
  }
  .hp-tool {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px 16px;
    cursor: pointer; transition: all 0.25s;
    position: relative; overflow: hidden;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .hp-tool:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
  .hp-tool:nth-child(1) { border-top: 2px solid rgba(0,212,255,0.3); }
  .hp-tool:nth-child(2) { border-top: 2px solid rgba(240,165,0,0.3); }
  .hp-tool:nth-child(3) { border-top: 2px solid rgba(0,255,170,0.3); }
  .hp-tool:nth-child(4) { border-top: 2px solid rgba(255,56,96,0.25); }
  .hp-tool:nth-child(1):hover { background: rgba(0,212,255,0.06); }
  .hp-tool:nth-child(2):hover { background: rgba(240,165,0,0.06); }
  .hp-tool:nth-child(3):hover { background: rgba(0,255,170,0.05); }
  .hp-tool:nth-child(4):hover { background: rgba(255,56,96,0.05); }
  .hp-tool-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 18px;
    background: rgba(0,212,255,0.1);
    border: 1px solid rgba(0,212,255,0.2);
  }
  .hp-tool-name {
    font-family: 'Orbitron', monospace;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.5px; color: var(--white); margin-bottom: 4px;
  }
  .hp-tool-desc { font-size: 11px; color: var(--muted); line-height: 1.4; }
  .hp-badge {
    position: absolute; top: 10px; right: 10px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px; padding: 2px 7px;
    border-radius: 10px; letter-spacing: 1px; text-transform: uppercase;
  }
  .badge-new { background: rgba(0,255,170,0.12); color: var(--success); border: 1px solid rgba(0,255,170,0.2); }
  .badge-hot { background: rgba(255,56,96,0.12); color: var(--danger); border: 1px solid rgba(255,56,96,0.2); }
  .badge-pro { background: rgba(240,165,0,0.1); color: var(--gold); border: 1px solid rgba(240,165,0,0.2); }

  /* RECENT */
  .hp-recent {
    padding: 0 20px;
    display: flex; flex-direction: column; gap: 10px;
    animation: hpFadeUp 0.6s 0.5s both;
  }
  .hp-recent-item {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.2s;
  }
  .hp-recent-item:hover {
    border-color: rgba(0,212,255,0.3);
    background: rgba(0,212,255,0.04);
    transform: translateX(4px);
  }
  .hp-thumb {
    width: 46px; height: 46px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,50,100,0.2));
    border: 1px solid rgba(0,212,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .hp-rname {
    font-family: 'Orbitron', monospace;
    font-size: 11px; font-weight: 600; color: var(--white); margin-bottom: 3px;
  }
  .hp-rmeta {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; color: var(--muted); letter-spacing: 0.5px;
  }
  .hp-status {
    width: 8px; height: 8px;
    border-radius: 50%; flex-shrink: 0; margin-left: auto;
  }
  .s-done { background: var(--success); box-shadow: 0 0 8px rgba(0,255,170,0.6); }
  .s-proc { background: var(--gold); box-shadow: 0 0 8px rgba(240,165,0,0.6); animation: hpPulse 1.5s infinite; }

  /* BOTTOM NAV */
  .hp-bottom-nav {
    position: fixed; bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 100%; max-width: 480px;
    padding: 12px 20px 24px;
    background: linear-gradient(0deg, rgba(5,8,16,0.98) 60%, transparent);
    backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: space-around;
    z-index: 100;
  }
  .hp-nav-item {
    display: flex; flex-direction: column;
    align-items: center; gap: 4px;
    cursor: pointer; padding: 8px 16px;
    border-radius: 12px; transition: all 0.2s;
    border: 1px solid transparent;
  }
  .hp-nav-item.active {
    background: rgba(0,212,255,0.1);
    border-color: rgba(0,212,255,0.2);
  }
  .hp-nav-icon { font-size: 20px; }
  .hp-nav-lbl {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 1px;
    color: var(--muted); text-transform: uppercase;
  }
  .hp-nav-item.active .hp-nav-lbl { color: var(--cyan); }

  /* FAB */
  .hp-fab {
    position: fixed; bottom: 75px; right: 20px;
    width: 54px; height: 54px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--cyan), #0055cc);
    border: 2px solid rgba(0,212,255,0.5);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 26px; font-weight: 300; color: white;
    box-shadow: 0 0 30px rgba(0,212,255,0.4);
    transition: all 0.3s; z-index: 200;
    animation: hpFabPulse 3s ease-in-out infinite;
  }
  .hp-fab:hover { transform: scale(1.1) rotate(10deg); }

  /* KEYFRAMES */
  @keyframes hpFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes hpFloat {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes hpPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes hpDrift1 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(40px,60px); }
  }
  @keyframes hpDrift2 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(-30px,-50px); }
  }
  @keyframes hpFabPulse {
    0%,100% { box-shadow: 0 0 30px rgba(0,212,255,0.4); }
    50% { box-shadow: 0 0 50px rgba(0,212,255,0.7); }
  }
`;

export default function Home() {
  const [activeNav, setActiveNav] = useState("home");

  const tools = [
    { icon: "🎨", name: "Konversi HD", desc: "Foto ke stensil thermal resolusi tinggi", badge: null },
    { icon: "✏️", name: "Sketsa Digital", desc: "Buat stensil dari sketsa manual", badge: "pro" },
    { icon: "⚡", name: "Auto Enhance", desc: "AI tingkatkan kualitas otomatis", badge: "new" },
    { icon: "🔥", name: "Preset Tatto", desc: "Template stensil terpopuler", badge: "hot" },
  ];

  const recent = [
    { icon: "🦋", name: "butterfly_stencil_v2", meta: "Hari ini · 2.4 MB · 1200×1600px", status: "done" },
    { icon: "🐉", name: "dragon_sleeve_final", meta: "Kemarin · 4.1 MB · sedang diproses", status: "proc" },
    { icon: "🌸", name: "rose_mandala_hd", meta: "3 hari lalu · 1.8 MB · 900×900px", status: "done" },
  ];

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "gallery", icon: "⊞", label: "Galeri" },
    { id: "process", icon: "⚙️", label: "Proses" },
    { id: "profile", icon: "👤", label: "Profil" },
  ];

  return (
    <div className="hp-root">
      <style>{styles}</style>
      <div className="hp-ambient-1" />
      <div className="hp-ambient-2" />

      <div className="hp-app">
        {/* NAV */}
        <nav className="hp-nav">
          <div className="hp-nav-logo">
            <div className="hp-logo-icon">◈</div>
            <div className="hp-logo-text">HOPE<span>+</span> STUDIO</div>
          </div>
          <div className="hp-nav-right">
            <div className="hp-credit-pill">💎 5 KREDIT</div>
            <div className="hp-avatar">H</div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hp-hero">
          <div className="hp-hero-label">
            <span className="hp-dot" />
            HD Stencil Engine v2.0
          </div>
          <div className="hp-greeting">Selamat datang</div>
          <h1 className="hp-title">HOPE<span className="hl">+</span><br />STUDIO</h1>
          <p className="hp-sub">Professional HD Stencil Engine</p>
        </div>

        {/* STATS */}
        <div className="hp-stats">
          <div className="hp-stat">
            <span className="hp-stat-val gold">5</span>
            <span className="hp-stat-lbl">Kredit</span>
          </div>
          <div className="hp-stat">
            <span className="hp-stat-val">12</span>
            <span className="hp-stat-lbl">Stensil</span>
          </div>
          <div className="hp-stat">
            <span className="hp-stat-val green">HD</span>
            <span className="hp-stat-lbl">Kualitas</span>
          </div>
        </div>

        {/* UPLOAD */}
        <div className="hp-section-title">Upload Desain</div>
        <div className="hp-upload">
          <div className="hp-upload-icon">📤</div>
          <div className="hp-upload-title">Upload Desain</div>
          <p className="hp-upload-desc">
            Ubah foto atau sketsa menjadi<br />stensil Thermal HD berkualitas tinggi
          </p>
          <button className="hp-upload-btn">📁 Pilih dari Galeri</button>
          <div className="hp-formats">JPG · PNG · SVG · WEBP · PDF</div>
        </div>

        {/* TOOLS */}
        <div className="hp-section-title">Fitur Utama</div>
        <div className="hp-tools">
          {tools.map((t, i) => (
            <div className="hp-tool" key={i}>
              <div className="hp-tool-icon">{t.icon}</div>
              <div>
                <div className="hp-tool-name">{t.name}</div>
                <div className="hp-tool-desc">{t.desc}</div>
              </div>
              {t.badge && (
                <span className={`hp-badge badge-${t.badge}`}>
                  {t.badge === "new" ? "BARU" : t.badge === "hot" ? "HOT" : "PRO"}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* RECENT */}
        <div className="hp-section-title">Riwayat Terbaru</div>
        <div className="hp-recent">
          {recent.map((r, i) => (
            <div className="hp-recent-item" key={i}>
              <div className="hp-thumb">{r.icon}</div>
              <div>
                <div className="hp-rname">{r.name}</div>
                <div className="hp-rmeta">{r.meta}</div>
              </div>
              <div className={`hp-status ${r.status === "done" ? "s-done" : "s-proc"}`} />
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div className="hp-fab">+</div>

      {/* BOTTOM NAV */}
      <div className="hp-bottom-nav">
        {navItems.map((n) => (
          <div
            key={n.id}
            className={`hp-nav-item ${activeNav === n.id ? "active" : ""}`}
            onClick={() => setActiveNav(n.id)}
          >
            <span className="hp-nav-icon">{n.icon}</span>
            <span className="hp-nav-lbl">{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
