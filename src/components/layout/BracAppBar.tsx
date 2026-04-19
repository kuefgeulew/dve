import { Bell, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BracBankLogoImage } from './BracBankLogoImage';

export interface BracAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

export function BracAppBar({ title, subtitle, showBack = false, backTo = '/' }: BracAppBarProps) {
  return (
    <header className="brac-app-bar">
      <div className="brac-app-bar__row">
        {showBack ? (
          <Link
            to={backTo}
            style={{
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: -2,
            }}
            aria-label="Back"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </Link>
        ) : null}
        <BracBankLogoImage variant="appBar" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: '#FFFFFF',
              lineHeight: 1.25,
              letterSpacing: 0.15,
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              style={{
                margin: 0,
                marginTop: 2,
                fontSize: 11,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Notifications"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 6,
            cursor: 'pointer',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
          }}
        >
          <Bell size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="brac-app-bar__gold-strip" aria-hidden />
    </header>
  );
}
