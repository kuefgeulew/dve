import type { DocumentType } from '../../types';

const OPTIONS: Array<{ value: DocumentType; label: string }> = [
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'LOAN_FORM', label: 'Loan Application' },
  { value: 'NID', label: 'NID / KYC' },
  { value: 'ACCOUNT_OPENING_FORM', label: 'Account Opening Form' },
];

export interface DocumentTypeSelectorProps {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
  disabled?: boolean;
}

export function DocumentTypeSelector({ value, onChange, disabled = false }: DocumentTypeSelectorProps) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label
        htmlFor="document-type-select"
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}
      >
        Document Type
      </label>
      <select
        id="document-type-select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as DocumentType)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.65 : 1,
          appearance: 'auto',
        }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
