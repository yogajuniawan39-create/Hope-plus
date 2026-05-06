import React from 'react';
import { UserButton } from '@clerk/clerk-react';

export default function Header({ userCredits = 0, setModalBuy }) {
  return (
    <div id="hud-header">
      <div className="hud-logo" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Logo Simbol Emas */}
        <img src="/logo-simbol.png" alt="Icon" style={{ height: '32px', marginRight: '10px' }} />
        {/* Logo Teks Emas */}
        <img src="/logo-teks.png" alt="Hope+ Studio" style={{ height: '18px' }} />
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
