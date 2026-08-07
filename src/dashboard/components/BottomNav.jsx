import { NavLink } from 'react-router-dom';
import { TAB_ITEMS } from '../data.jsx';

/* ============================================================
   Mobile bottom bar — five plain tabs sitting on a rule.
   No floating pill, no detached search button, no springs.
   ============================================================ */
export default function BottomNav() {
  return (
    <nav className="dash-tabbar">
      {TAB_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === '/dashboard'}
          className={({ isActive }) => `dash-tab ${isActive ? 'active' : ''}`}
        >
          <item.icon size={19} strokeWidth={1.7} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
