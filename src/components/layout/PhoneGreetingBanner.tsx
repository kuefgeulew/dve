const GREETING_LINE = 'Good Afternoon, Mortoza';

/** Navy gradient strip with gold-underlined greeting; layered depth via CSS. */
export function PhoneGreetingBanner() {
  return (
    <div className="phone-greeting-banner">
      <p
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          color: '#ffffff',
          lineHeight: 1.35,
        }}
      >
        <span className="phone-greeting-underline">{GREETING_LINE}</span>
      </p>
    </div>
  );
}
