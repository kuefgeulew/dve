/**
 * Renders a convincing CSS-based visual representation of a banking document.
 * Used when no real image file is available (standard mode).
 * Must match the aspect ratios and regional layout that bounding boxes reference.
 * Bounding box coordinates (0.0-1.0) in rules are calibrated to these layouts.
 */

import type { CSSProperties } from 'react';
import type { DocumentType } from '../../types';

interface MockDocumentPlaceholderProps {
  documentType: DocumentType;
  size?: 'thumbnail' | 'full';
}

function lineStyle(top: string, left: string, width: string, height = 2): CSSProperties {
  return {
    position: 'absolute',
    top,
    left,
    width,
    height,
    background: '#d6d6d6',
  };
}

export function MockDocumentPlaceholder({
  documentType,
  size = 'full',
}: MockDocumentPlaceholderProps) {
  const thumbnail = size === 'thumbnail';
  const outer: CSSProperties = {
    width: thumbnail ? 160 : '100%',
    maxWidth: thumbnail ? 160 : 560,
    aspectRatio:
      documentType === 'CHEQUE'
        ? '2.4 / 1'
        : documentType === 'NID'
          ? '0.63 / 1'
          : '0.77 / 1',
    background: '#FAFAFA',
    border: '1px solid #DDD',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    color: '#333',
    fontSize: thumbnail ? 7 : 11,
    lineHeight: 1.2,
  };

  if (documentType === 'CHEQUE') {
    return (
      <div style={outer}>
        <div style={{ position: 'absolute', top: '7%', left: '8%', fontWeight: 600 }}>
          BRAC Bank Limited | Mohakhali Branch
        </div>
        <div style={{ position: 'absolute', top: '7%', right: '8%', fontFamily: 'var(--font-mono)' }}>
          No: 004521
        </div>

        <div style={{ position: 'absolute', top: '30%', left: '8%' }}>Pay to:</div>
        <div style={lineStyle('34%', '8%', '50%')} />

        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '60%',
            width: '30%',
            height: '13%',
            border: '1px solid #c9c9c9',
            borderRadius: 4,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 600,
          }}
        >
          ৳ 25,000
        </div>

        <div style={lineStyle('48%', '8%', '67%')} />
        <div style={{ position: 'absolute', top: '42%', left: '8%' }}>Twenty Five Thousand Taka Only</div>

        <div style={{ position: 'absolute', top: '12%', left: '63%' }}>Date:</div>
        <div style={lineStyle('16%', '69%', '20%')} />

        <div
          style={{
            position: 'absolute',
            top: '70%',
            left: '60%',
            width: '30%',
            height: '15%',
            border: '1px dotted #9c9c9c',
            borderRadius: 4,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '0%',
            right: '0%',
            bottom: '0%',
            background: '#efefef',
            padding: '3% 8%',
            fontFamily: 'var(--font-mono)',
            color: '#7b7b7b',
          }}
        >
          004521 1501****089 010
        </div>
      </div>
    );
  }

  if (documentType === 'NID') {
    return (
      <div style={outer}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: '#0f7d3b' }} />
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '8%',
            width: '10%',
            height: '8%',
            borderRadius: '50%',
            background: '#d8d8d8',
          }}
        />
        <div style={{ position: 'absolute', top: '10%', left: '22%', fontWeight: 700 }}>জাতীয় পরিচয়পত্র</div>

        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '25%',
            height: '45%',
            background: '#dfdfdf',
            border: '1px solid #ccc',
            borderRadius: 4,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span style={{ fontSize: thumbnail ? 10 : 16 }}>👤</span>
        </div>

        <div style={{ position: 'absolute', top: '24%', left: '40%' }}>Name: Fatema Begum</div>
        <div style={{ position: 'absolute', top: '32%', left: '40%' }}>DOB: 1992-03-18</div>
        <div style={{ position: 'absolute', top: '40%', left: '40%' }}>NID: 19876543210987654</div>
        <div style={lineStyle('62%', '8%', '84%')} />
        <div style={{ position: 'absolute', top: '66%', left: '8%' }}>
          House 12, Road 5, Mohammadpur, Dhaka-1207
        </div>
      </div>
    );
  }

  const title =
    documentType === 'ACCOUNT_OPENING_FORM'
      ? 'BRAC Bank - Account Opening Form'
      : 'BRAC Bank - SME Loan Application Form';

  return (
    <div style={outer}>
      <div style={{ position: 'absolute', top: '8%', left: 0, right: 0, textAlign: 'center', fontWeight: 700 }}>
        {title}
      </div>

      <div style={{ position: 'absolute', top: '18%', left: '8%', right: '8%', display: 'grid', gap: '7%' }}>
        <div style={{ position: 'relative', height: '10%' }}>
          <span>Name:</span>
          <div style={lineStyle('80%', '22%', '70%')} />
        </div>
        <div style={{ position: 'relative', height: '10%' }}>
          <span>{documentType === 'ACCOUNT_OPENING_FORM' ? 'Account Type:' : 'Loan Amount:'}</span>
          <div style={lineStyle('80%', '30%', '62%')} />
        </div>
        <div style={{ position: 'relative', height: '10%' }}>
          <span>{documentType === 'ACCOUNT_OPENING_FORM' ? 'NID Number:' : 'Purpose:'}</span>
          <div style={lineStyle('80%', '26%', '66%')} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          top: '58%',
          height: '26%',
          border: '1px solid #cfcfcf',
          borderRadius: 6,
          padding: '3%',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '6%' }}>
          {documentType === 'ACCOUNT_OPENING_FORM' ? 'Nominee Section' : 'Guarantor Section'}
        </div>
        <div style={lineStyle('38%', '0%', '80%')} />
        <div style={lineStyle('62%', '0%', '80%')} />
      </div>

      <div style={lineStyle('90%', '8%', '35%')} />
      <div style={lineStyle('90%', '57%', '35%')} />
    </div>
  );
}
