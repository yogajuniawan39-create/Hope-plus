import React from 'react';
import { SignInButton } from '@clerk/clerk-react';

export default function Paywall() {
  return (
    <div id="paywall-overlay">
      <div className="paywall-box">
        <div className="corner-deco tl"></div><div className="corner-deco tr"></div>
        <div className="corner-deco bl"></div><div className="corner-deco br"></div>
        <div className="paywall-brand">HOPE<span>+</span></div>
        <div className="paywall-tagline">Professional HD Stencil Engine</div>
        <div className="free-badge">✦ MASUK UNTUK MEMULAI ✦</div>

        <div style={{ marginTop: '20px' }}>
          <SignInButton mode="modal">
            <button className="btn btn-cyan">
              <span style={{ marginRight: '8px' }}>🌐</span> 
              MASUK DENGAN GOOGLE
            </button>
          </SignInButton>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '20px', textAlign: 'center', lineHeight: '1.5' }}>
          Dengan masuk, Anda menyetujui akses ke fitur<br/>Stencil Engine kami.
        </p>
      </div>
    </div>
  );
}
