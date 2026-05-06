import React, { useState } from 'react';

const packages = [
  { credits: 5, price: 25000, label: 'Rp 25.000' },
  { credits: 10, price: 45000, label: 'Rp 45.000', popular: true },
  { credits: 25, price: 100000, label: 'Rp 100.000' },
  { credits: 50, price: 175000, label: 'Rp 175.000' },
];

export default function ModalBuy({ isOpen, onClose, user, onSuccess }) {
  const [selected, setSelected] = useState(packages[1]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBuy = async () => {
    setLoading(true);
    try {
      const orderId = `HOPE-${user.id}-${Date.now()}`;

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: selected.price,
          credits: selected.credits,
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.firstName || 'User'
        })
      });

      const data = await response.json();
      alert('Response API: ' + JSON.stringify(data));

      if (!data.token) {
        alert('Error: ' + JSON.stringify(data.error));
        setLoading(false);
        return;
      }

      const snap = window.snap;
      if (!snap) {
        alert('Midtrans snap belum loaded!');
        setLoading(false);
        return;
      }

      snap.pay(data.token, {
        onSuccess: () => { onSuccess(selected.credits); onClose(); },
        onPending: () => { alert('Pembayaran pending!'); onClose(); },
        onError: () => { alert('Pembayaran gagal!'); },
        onClose: () => setLoading(false)
      });
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">BELI KREDIT</div>
        <div className="modal-sub">1 kredit = 1 proses stensil HD</div>

        <div className="price-cards">
          {packages.map(pkg => (
            <div key={pkg.credits}
              className={`price-card ${selected.credits === pkg.credits ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
              onClick={() => setSelected(pkg)}>
              {pkg.popular && <div className="badge">POPULER</div>}
              <div className="amount">{pkg.credits}</div>
              <div className="credits">kredit</div>
              <div className="price">{pkg.label}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-gold" onClick={handleBuy} disabled={loading}>
          {loading ? 'MEMPROSES...' : '✓ BAYAR SEKARANG'}
        </button>
      </div>
    </div>
  );
}