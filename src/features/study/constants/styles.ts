// Brand gradient borders, drawn with a padding-box/border-box background pair
// so the fill stays solid. Every stop is at 80 % opacity (alpha `cc`) so the
// study UI is there without competing with the PDF. Full class strings live
// here so Tailwind sees them.
export const GRADIENT_BORDER =
  'border border-transparent [background:linear-gradient(#18181b,#18181b)_padding-box,linear-gradient(90deg,#6b46c1cc,#b83280cc,#f6e05ecc,#38b2accc)_border-box]';

export const PANEL_GRADIENT_BORDER =
  'border border-transparent [background:linear-gradient(160deg,#1c1c20,#111113)_padding-box,linear-gradient(135deg,#6b46c1cc,#b83280cc,#f6e05ecc,#38b2accc)_border-box]';

export const TOAST_GRADIENT_BORDER =
  'border border-transparent [background:linear-gradient(#1c1c20,#1c1c20)_padding-box,linear-gradient(90deg,#6b46c1cc,#b83280cc,#f6e05ecc,#38b2accc)_border-box]';

export const BREAK_BORDER = 'border border-[#38b2accc] bg-[#18181b]';
export const PAUSED_BORDER = 'border border-dashed border-white/24 bg-[#18181b]';
export const IDLE_BORDER = 'border border-white/12 bg-[#18181b]';

/** Brand gradient fill for progress bars and the focus dot. */
export const GRADIENT_FILL = 'bg-[linear-gradient(90deg,#6b46c1cc,#b83280cc,#f6e05ecc,#38b2accc)]';

export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900';

/** Above the header (z-60) and the resource viewer (z-100). */
export const LAYER_SHEET = 'z-[110]';
/** Comboboxes portal to <body>; they must sit above the sheet and the viewer. */
export const LAYER_POPOVER = 'z-[120]';
