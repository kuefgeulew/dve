import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { useErrorLog } from '../../hooks/useErrorLog';
import { BracAppBar } from './BracAppBar';
import { useBracAppBarRoute } from './useBracAppBarRoute';
import { AppModeSwitcher } from './AppModeSwitcher';
import { BracBankLogoWordmark } from './BracBankLogoWordmark';
import { BottomNav } from './BottomNav';
import { PhoneGreetingBanner } from './PhoneGreetingBanner';
import { PhoneShellRipple } from './PhoneShellRipple';
import { PhoneHomeIndicator } from './PhoneHomeIndicator';
import { StatusBar } from './StatusBar';

interface MobileContainerProps {
  children: ReactNode;
}

/** Faint BRAC-inspired ripples + swoosh, behind Live Stats. */
function BracStatsRippleWatermark() {
  return (
    <div className="live-stats-watermark" aria-hidden>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="28" stroke="#1B6FC8" strokeWidth="1.2" opacity="0.4" />
        <circle cx="120" cy="120" r="52" stroke="#C9A86C" strokeWidth="1" opacity="0.35" />
        <circle cx="120" cy="120" r="78" stroke="#1B6FC8" strokeWidth="0.9" opacity="0.3" />
        <circle cx="120" cy="120" r="104" stroke="#C9A86C" strokeWidth="0.75" opacity="0.25" />
        <circle cx="120" cy="120" r="128" stroke="#1B6FC8" strokeWidth="0.6" opacity="0.18" />
        <path
          d="M 32 176 Q 120 68 208 40"
          stroke="#1B6FC8"
          strokeWidth="1.5"
          opacity="0.22"
          strokeLinecap="round"
        />
        <path
          d="M 44 162 Q 118 82 196 54"
          stroke="#C9A86C"
          strokeWidth="1"
          opacity="0.18"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

const LOW_STP_THRESHOLD = 75;

export function MobileContainer({ children }: MobileContainerProps) {
  const { stats } = useErrorLog();
  const appBarProps = useBracAppBarRoute();

  return (
    <div className="mobile-container-outer">
      <div className="mobile-container-grid">
        <aside className="mobile-container-side desktop-sidebar" style={{ width: 220, color: 'var(--text-primary)' }}>
          <div className="desktop-sidebar-brand">
            <BracBankLogoWordmark />
          </div>
          <div className="desktop-sidebar-gold-rule" aria-hidden />
          <p className="desktop-sidebar-product">Document Validation Engine</p>
          <AppModeSwitcher />
        </aside>

        <div className="phone-device-frame">
          <span className="phone-device-side-key" aria-hidden />
          <div className="phone-device-bezel">
            <div className="phone-device-bezel-inner phone-shell phone-shell--branded">
              <PhoneShellRipple />
              <PhoneHomeIndicator />
              <div className="phone-shell-content">
                <div className="phone-top-chrome">
                  <StatusBar />
                  <BracAppBar {...appBarProps} />
                </div>
                <PhoneGreetingBanner />
                <div
                  className="phone-scroll-content"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingBottom: 68,
                  }}
                >
                  {children}
                </div>
                <BottomNav />
              </div>
            </div>
          </div>
        </div>

        <aside className="mobile-container-side" style={{ minWidth: 0, color: 'var(--text-primary)' }}>
          <div className="live-stats-header">
            <p className="live-stats-eyebrow">Throughput</p>
            <h2 className="live-stats-heading">Live stats</h2>
            <p className="live-stats-lede">Validation engine at a glance</p>
          </div>
          <div className="live-stats-panel">
            <BracStatsRippleWatermark />
            <div className="live-stats-grid">
              <div className="live-stat-card live-stat-card--blue">
                <div className="live-stat-card-label">Total docs</div>
                <AnimatedNumber
                  value={stats.totalDocumentsProcessed}
                  className="live-stat-card-value-blue"
                />
              </div>
              <div className="live-stat-card live-stat-card--amber">
                <div className="live-stat-card-label">STP rate</div>
                <div className="live-stat-stp-row">
                  <span className="live-stat-card-value-stp">
                    <AnimatedNumber value={stats.stpRate} decimals={1} />
                    %
                  </span>
                  {stats.stpRate < LOW_STP_THRESHOLD ? (
                    <span className="live-stat-stp-warn" title="Below target STP">
                      <AlertTriangle size={16} color="#8F7344" strokeWidth={2.2} aria-hidden />
                      Low
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="live-stat-card live-stat-card--signal">
                <div className="live-stat-card-label">Top warning</div>
                {stats.mostCommonWarning ? (
                  <span className="live-stat-warning-pill">{stats.mostCommonWarning}</span>
                ) : (
                  <span className="live-stat-warning-pill live-stat-warning-pill--empty">None</span>
                )}
              </div>
            </div>
          </div>
          <Link to="/dashboard" className="live-stats-footer-link">
            Open dashboard →
          </Link>
        </aside>
      </div>
    </div>
  );
}
