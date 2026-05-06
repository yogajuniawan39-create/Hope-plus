import React from 'react';
import { UserButton } from '@clerk/clerk-react';

export default function Header({ userCredits = 0, setModalBuy }) {
  return (
    <div id="hud-header" style={{ padding: '15px 20px' }}>
      <div className="hud-logo" style={{ display: 'flex', alignItems: 'center' }}>
        {/* LOGO SIMBOL DIPERBESAR */}
        <img src="/logo-simbol.png" alt="Icon" style={{ height: '42px', marginRight: '12px' }} />
        {/* LOGO TEKS DIPERBESAR */}
        <img src="/logo-teks.png" alt="Hope+ Studio" style={{ height: '22px' }} />
      </div>
      
      <div className="hud-right">
        <div className="credit-hud" onClick={() => setModalBuy(true)}>
          <span className="icon">💎</span>
          <div>
            <div className="count">{userCredits}</div>
            <div className="label">KREDIT</div>
          </div>
        </div>
        
        <div className="account-btn" style={{ border: 'none', background: 'transparent' }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
