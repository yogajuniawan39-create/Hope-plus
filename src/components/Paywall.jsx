import React, { useState } from 'react';

export default function Paywall({ doLogin, doRegister, doLicense }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div id="paywall-overlay">
      <div className="paywall-box">
        <div className="corner-deco tl"></div><div className="corner-deco tr"></div>
        <div className="corner-deco bl"></div><div className="corner-deco br"></div>
        <div className="paywall-brand">HOPE<span>+</span></div>
        <div className="paywall-tagline">Professional HD Stencil Engine</div>
        <div className="free-badge">✦ 5 KREDIT GRATIS ✦</div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>MASUK</button>
          <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>DAFTAR</button>
          <button className={`tab-btn ${activeTab === 'license' ? 'active' : ''}`} onClick={() => setActiveTab('license')}>LISENSI</button>
        </div>

        {activeTab === 'login' && (
          <div className="tab-content active">
            <div className="field"><label>Username</label><input type="text" id="login-user" placeholder="username kamu" /></div>
            <div className="field"><label>Password</label><input type="password" id="login-pass" placeholder="••••••••" /></div>
            <button className="btn btn-cyan" onClick={doLogin}>MASUK →</button>
          </div>
        )}
        {activeTab === 'register' && (
          <div className="tab-content active">
            <div className="field"><label>Username</label><input type="text" id="reg-user" placeholder="buat username" /></div>
            <div className="field"><label>Email</label><input type="email" id="reg-email" placeholder="email@kamu.com" /></div>
            <div className="field"><label>Password</label><input type="password" id="reg-pass" placeholder="min 6 karakter" /></div>
            <button className="btn btn-cyan" onClick={doRegister}>DAFTAR GRATIS →</button>
          </div>
        )}
        {activeTab === 'license' && (
          <div className="tab-content active">
            <input type="text" className="pw-input" id="license-input" placeholder="KODE LISENSI / ADMIN" />
            <button className="btn btn-cyan" onClick={doLicense}>BUKA KUNCI →</button>
          </div>
        )}
      </div>
    </div>
  );
}