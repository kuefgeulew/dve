import { BarChart2, House } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const hidden =
    path === '/processing' ||
    path === '/result/confirm' ||
    path === '/result/review' ||
    path.startsWith('/result/warning/');

  if (hidden) {
    return null;
  }

  const homeActive = location.pathname === '/';
  const dashboardActive = location.pathname.startsWith('/dashboard');

  return (
    <div className="bottom-nav-glass">
      <Link to="/" style={{ color: homeActive ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
        <House size={20} />
      </Link>
      <Link
        to="/dashboard"
        style={{ color: dashboardActive ? 'var(--brand-primary)' : 'var(--text-muted)' }}
      >
        <BarChart2 size={20} />
      </Link>
    </div>
  );
}
