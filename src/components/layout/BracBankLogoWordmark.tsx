import { BracBankLogoImage } from './BracBankLogoImage';

/** Official BRAC Bank logo for desktop sidebar (full wordmark + tagline artwork). */
export function BracBankLogoWordmark() {
  return (
    <div aria-label="BRAC Bank" style={{ width: '100%' }}>
      <BracBankLogoImage variant="sidebar" />
    </div>
  );
}
