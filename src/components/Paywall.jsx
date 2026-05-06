import React from 'react';
import { SignInButton } from '@clerk/clerk-react';

export default function Paywall() {
  return (
    <div id="paywall-overlay">
      <div className="paywall-box" style={{ textAlign: 'center' }}>
        <div className="corner-deco tl"></div><div className="corner-deco tr"></div>
        <div className="corner-deco bl"></div><div className="corner-deco br"></div>
        
        {/* Logo Full Emas di Tengah */}
        <div className="paywall-brand" style={{ marginBottom: '20px' }}>
          <img src="/logo-full.png" alt="Hope+ Studio" style={{ width: '180px', height: 'auto' }} />
        </div>
        
        <div className="paywall-tagline">Professional HD Stencil Engine</div>
        <div className="free-badge">✦ MASUK UNTUK MEMULAI ✦</div>

        <div style={{ marginTop: '25px' }}>
          <SignInButton mode="modal">
            <button className="btn btn-cyan">
              <span style={{ marginRight: '8px' }}>🌐</span> 
              MASUK DENGAN GOOGLE
            </button>
          </SignInButton>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '25px', lineHeight: '1.5' }}>
          Dengan masuk, Anda menyetujui akses ke fitur<br/>Stencil Engine kami.
        </p>
      </div>
    </div>
  );
}
