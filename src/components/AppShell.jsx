import { Button } from 'react-bootstrap';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiBriefcase,
  FiCompass,
  FiEdit3,
  FiMessageSquare,
  FiMic,
  FiSearch,
  FiUser,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../context/useAuth';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: FiBarChart2 },
    ],
  },
  {
    title: 'Resume Suite',
    items: [
      { to: '/resume/analyze', label: 'Analyze Resume', icon: FiSearch },
      { to: '/resume/chat', label: 'Resume Chat', icon: FiMessageSquare },
      { to: '/resume/jobs', label: 'Job Matches', icon: FiBriefcase },
      { to: '/resume/create', label: 'Resume Creator', icon: FiEdit3 },
    ],
  },
  {
    title: 'Practice',
    items: [
      { to: '/simulator', label: 'Career Simulator', icon: FiCompass },
      { to: '/interview', label: 'Interview Bot', icon: FiMic },
    ],
  },
];

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/resume/analyze': 'Resume Analysis',
  '/resume/chat': 'Resume Coach Chat',
  '/resume/jobs': 'Job Recommendations',
  '/resume/create': 'Resume Creator',
  '/simulator': 'Career Simulator',
  '/interview': 'Interview Bot',
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = routeTitles[location.pathname] || 'PathPilot';

  return (
    <div className="app-shell app-shell-grid">
      <aside className="app-sidebar glass-card">
        <div className="app-brand" role="button" onClick={() => navigate('/dashboard')}>
          <span className="brand-mark brand-mark-lg">
            <FiZap />
          </span>
          <div>
            <strong>PathPilot</strong>
            <div className="app-brand-subtitle">Career OS for resumes, interviews, and growth</div>
          </div>
        </div>

        <div className="workspace-status glass-panel">
          <div className="workspace-label">Workspace</div>
          <div className="workspace-title">All your tools in one flow</div>
          <small className="text-light opacity-75">Move between resume prep, mock interviews, and planning without leaving the app.</small>
        </div>

        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <div key={group.title} className="nav-group">
              <div className="nav-group-title">{group.title}</div>
              <div className="d-flex flex-column gap-2">
                {group.items.map((item) => (
                  <NavLink
                    to={item.to}
                    key={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="sidebar-link-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="app-main">
        <div className="app-topbar glass-card">
          <div>
            <div className="topbar-kicker">Workspace</div>
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>

          <div className="topbar-actions">
            <div className="topbar-user glass-panel">
              <FiUser />
              <span className="user-email">{user?.email}</span>
            </div>
            <Button
              size="sm"
              variant="outline-light"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
