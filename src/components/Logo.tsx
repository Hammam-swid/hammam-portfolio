/**
 * The logo as SVG, in the right version for the current theme: the white mark
 * on dark, the gradient mark on light. Both are rendered and CSS shows one
 * (see .logo-dark / .logo-light in index.css), so it never flashes the wrong one.
 */
export default function Logo({ alt = "", className = "" }: { alt?: string; className?: string }) {
  return (
    <>
      <img src="/logo.svg" alt={alt} className={`logo-dark ${className}`} />
      <img src="/lightmode-logo.svg" alt={alt} className={`logo-light ${className}`} />
    </>
  );
}
