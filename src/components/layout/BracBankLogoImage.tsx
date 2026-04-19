/** Official BRAC Bank logo asset (symbol + wordmark + tagline). */
export const BRAC_BANK_LOGO_SRC = '/assets/brac-bank-official-logo.png';

type BracBankLogoImageProps = {
  /** Compact mark for the in-app header row. */
  variant: 'appBar' | 'sidebar';
};

export function BracBankLogoImage({ variant }: BracBankLogoImageProps) {
  if (variant === 'appBar') {
    return (
      <img
        src={BRAC_BANK_LOGO_SRC}
        alt="BRAC Bank"
        style={{
          height: 34,
          width: 'auto',
          maxWidth: 120,
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'left center',
          flexShrink: 0,
        }}
        draggable={false}
      />
    );
  }

  return (
    <img
      src={BRAC_BANK_LOGO_SRC}
      alt="BRAC Bank, আস্থা অবিচল"
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: 88,
        display: 'block',
        objectFit: 'contain',
        objectPosition: 'left center',
      }}
      draggable={false}
    />
  );
}
