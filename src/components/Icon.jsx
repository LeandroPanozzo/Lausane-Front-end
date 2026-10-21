const PATHS = {
  truck: (
    <>
      <rect x="1.2" y="8" width="12.5" height="8" rx="1" />
      <path d="M13.7 11h3.6l3.5 3.2V16h-7.1z" />
      <circle cx="6" cy="18.2" r="1.8" />
      <circle cx="16.8" cy="18.2" r="1.8" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.2" cy="6.2" r="2.3" />
      <circle cx="6.2" cy="17.8" r="2.3" />
      <path d="M8 7.6 19.5 19" />
      <path d="M8 16.4 19.5 5" />
    </>
  ),
  box: (
    <>
      <path d="M12 3.2 20 7.4 12 11.6 4 7.4z" />
      <path d="M4 7.4v9.2L12 20.8l8-4.2V7.4" />
      <path d="M12 11.6v9.2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.2" r="3.1" />
      <path d="M3 20c0-3.4 2.7-6.1 6-6.1s6 2.7 6 6.1" />
      <circle cx="17.3" cy="9" r="2.3" />
      <path d="M15.6 14.1c2.5.5 4.4 2.7 4.4 5.4" />
    </>
  ),
  factory: (
    <>
      <path d="M4 21V9.2L12 4l8 5.2V21" />
      <path d="M3 21h18" />
      <path d="M9.8 21v-6.2h4.4V21" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3.2 19 6v6c0 4.6-3 7.7-7 9.1-4-1.4-7-4.5-7-9.1V6z" />
      <path d="M9 12.1 11.1 14.2 15.3 10" />
    </>
  ),
};

export default function Icon({ name, size = 22, className = "" }) {
  const content = PATHS[name];
  if (!content) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
