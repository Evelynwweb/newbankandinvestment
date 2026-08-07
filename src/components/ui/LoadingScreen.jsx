import BrandMark from './BrandMark.jsx';
import './loader.css';

/* ============================================================
   Loading state. `inline` renders a centered page loader that
   keeps the surrounding shell; otherwise a full-screen splash.
   ============================================================ */
export default function LoadingScreen({ inline = false, label = 'Loading' }) {
  return (
    <div className={inline ? 'brand-loader-inline' : 'brand-loader-screen'}>
      <div className="brand-loader-mark">
        <span className="brand-loader-ring" />
        <BrandMark size={inline ? 34 : 44} className="brand-loader-logo" />
      </div>
      <p className="brand-loader-text">
        {label}<span>.</span><span>.</span><span>.</span>
      </p>
    </div>
  );
}
