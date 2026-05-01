import { Button } from 'react-bootstrap';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiBriefcase,
  FiCompass,
  FiEdit3,
  FiMenu,
  FiMessageSquare,
  FiMic,
  FiMoon,
  FiSearch,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import pathpilotLogo from '../assets/Pathpilot.png';

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
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = routeTitles[location.pathname] || 'PathPilot';

  return (
    <div className="app-shell app-shell-grid">
      <aside className={`app-sidebar glass-card ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="app-brand" role="button" onClick={() => navigate('/dashboard')}>
          <img src={pathpilotLogo} alt="PathPilot logo" className="brand-logo brand-logo-lg" />
          <div className={`brand-copy ${sidebarCollapsed ? 'd-none' : ''}`}>
            <strong>PathPilot</strong>
            <div className="app-brand-subtitle">Focused workspace for resumes, interviews, and job prep</div>
          </div>
        </div>

        <div className={`workspace-status glass-panel ${sidebarCollapsed ? 'd-none' : ''}`}>
          <div className="workspace-label">Workspace</div>
          <div className="workspace-title">Choose one task and stay focused</div>
          <small className="text-soft">Use the left menu to move between tools without the extra dashboard clutter.</small>
        </div>

        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <div key={group.title} className="nav-group">
              <div className={`nav-group-title ${sidebarCollapsed ? 'd-none' : ''}`}>{group.title}</div>
              <div className="d-flex flex-column gap-2">
                {group.items.map((item) => (
                  <NavLink
                    to={item.to}
                    key={item.to}
                    className={({ isActive }) => `sidebar-link ${sidebarCollapsed ? 'collapsed' : ''} ${isActive ? 'active' : ''}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="sidebar-link-icon" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="app-main">
        <div className="app-topbar glass-card">
          <div className="topbar-copy">
            <div className="topbar-kicker">Workspace</div>
            <h1 className="topbar-title">{pageTitle}</h1>
            <p className="topbar-subtitle">Premium AI workflows for resumes, interviews, and career momentum.</p>
          </div>

          <div className="topbar-actions">
            <Button variant="outline-light" className="icon-button" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <FiMenu />
            </Button>
            <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <span className={`theme-toggle-track ${theme}`}>
                <span className="theme-toggle-thumb">
                  {theme === 'dark' ? <FiMoon /> : <FiSun />}
                </span>
              </span>
            </button>
            <div className="topbar-user glass-panel">
              <FiUser />
              <span className="user-email">{user?.email}</span>
            </div>
            <Button
              size="sm"
              variant="outline-light"
              onClick={() => {
                logout();
                navigate('/');
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
