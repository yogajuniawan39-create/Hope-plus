import React from 'react';
import { SignInButton } from '@clerk/clerk-react';

export default function Paywall() {
  return (
    <div id="paywall-overlay">
      <div className="paywall-box" style={{ textAlign: 'center', padding: '40px 20px', position: 'relative' }}>
        <div className="corner-deco tl"></div><div className="corner-deco tr"></div>
        <div className="corner-deco bl"></div><div className="corner-deco br"></div>
        
        {/* LOGO DIPERBESAR SECARA SIGNIFIKAN */}
        <div className="paywall-brand" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo-full.png" alt="Hope+ Studio" style={{ width: '260px', maxWidth: '90%', height: 'auto', position: 'relative', zIndex: 10 }} />
        </div>
        
        <div className="paywall-tagline" style={{ fontSize: '16px', marginBottom: '15px', position: 'relative', zIndex: 10 }}>Professional HD Stencil Engine</div>
        <div className="free-badge" style={{ fontSize: '13px', padding: '6px 12px', position: 'relative', zIndex: 10 }}>✦ MASUK UNTUK MEMULAI ✦</div>

        {/* TOMBOL DIPERBAIKI: Hapus mode="modal" agar aman di HP, dan set zIndex tinggi agar tidak tertutup elemen lain */}
        <div style={{ marginTop: '35px', position: 'relative', zIndex: 999 }}>
          <SignInButton forceRedirectUrl="/">
            <button className="btn btn-cyan" style={{ cursor: 'pointer', padding: '15px 25px', fontSize: '16px', fontWeight: 'bold' }}>
              <span style={{ marginRight: '8px' }}>🌐</span> 
              MASUK DENGAN GOOGLE
            </button>
          </SignInButton>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '30px', lineHeight: '1.6', position: 'relative', zIndex: 10 }}>
          Dengan masuk, Anda menyetujui akses ke fitur<br/>Stencil Engine kami.
        </p>
      </div>
    </div>
  );
}
