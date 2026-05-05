import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';

export default function Header({ userCredits = 0, setModalBuy }) {
  const { user } = useUser();

  return (
    <div id="hud-header">
      <div className="hud-logo">
        <div className="hud-logo-text">HOPE<span>+</span></div>
      </div>
      <div className="hud-right">
        <div className="credit-hud" onClick={() => setModalBuy(true)}>
          <span className="icon">💎</span>
          <div>
            <div className="count">{userCredits}</div>
            <div className="label">KREDIT</div>
          </div>
        </div>
        
        {/* Tombol Profil Otomatis dari Clerk */}
        <div className="account-btn" style={{ border: 'none', background: 'transparent' }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
