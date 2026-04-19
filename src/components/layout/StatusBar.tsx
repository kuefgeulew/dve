import { useEffect, useState } from 'react';
import { Battery, Signal, Wifi } from 'lucide-react';

function formatStatusTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="phone-status-bar" role="status" aria-live="polite" aria-atomic="true">
      <span className="phone-status-bar-time">{formatStatusTime(now)}</span>
      {/* Punch-hole camera */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 10,
          width: 11,
          height: 11,
          marginLeft: -5.5,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #2a2a30 0%, #0a0a0c 55%, #000 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.12), 0 1px 3px rgba(0,0,0,0.5)',
        }}
      />
      <div className="phone-status-bar-icons">
        <Signal size={14} strokeWidth={2.2} aria-hidden />
        <Wifi size={14} strokeWidth={2.2} aria-hidden />
        <Battery size={14} strokeWidth={2.2} aria-hidden />
      </div>
    </div>
  );
}
