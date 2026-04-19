/** Ambient ripples — navy + warm gold, low contrast over glass background. */
export function PhoneShellRipple() {
  return (
    <div className="phone-shell-ripple" aria-hidden>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rippleGlow" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1B6FC8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1B6FC8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="88" fill="none" stroke="#1B6FC8" strokeWidth="1" strokeOpacity="0.07" />
        <circle cx="200" cy="200" r="148" fill="none" stroke="#C9A86C" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="200" cy="200" r="208" fill="none" stroke="#1B6FC8" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="200" cy="200" r="260" fill="url(#rippleGlow)" />
      </svg>
    </div>
  );
}
