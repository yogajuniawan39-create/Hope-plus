import React from 'react';

export default function Header({ user, setModalBuy, setModalAcc }) {
  return (
    <div id="hud-header">
      <div className="hud-logo">
        <div className="hud-logo-text">HOPE<span>+</span></div>
      </div>
      <div className="hud-right">
        <div className="credit-hud" onClick={() => setModalBuy(true)}>
          <span className="icon">💎</span>
          <div>
            <div className="count">{user?.credits || 0}</div>
            <div className="label">KREDIT</div>
          </div>
        </div>
        <div className="account-btn" onClick={() => setModalAcc(true)}>👤</div>
      </div>
    </div>
  );
}