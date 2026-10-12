import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Building2, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, Bell, Clock, Calendar, User, Globe, Check, Plus } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { MODULE_GROUPS } from '../constants/appModules';
import UserProfileModal from './UserProfileModal';
import './Layout.css';

const LiveClock = ({ locale }: { locale: { dateFormat: string, timeFormat: string } }) => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 250);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        if (locale.dateFormat === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
        if (locale.dateFormat === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
        return `${month}/${day}/${year}`; // MM/DD/YYYY
    };

    const formatTime = (d: Date) => {
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: locale.timeFormat === '12h'
        });
    };

    return (
        <div className="live-clock" title="Current Server Time">
            <Calendar size={14} className="text-gray-400" />
            <span style={{ marginRight: '8px' }}>{formatDate(date)}</span>
            <Clock size={14} className="text-gray-400" />
            <span>{formatTime(date)}</span>
        </div>
    );
};

const Layout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { settings, organizations, activeTenantId, switchOrganization } = useSettings();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Default all groups to open (true)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
        MODULE_GROUPS.reduce((acc, group) => ({ ...acc, [group.title]: true }), {})
    );

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const baseNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    const renderNavLink = (item: { path: string, label: string, icon: any }) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
        return (
            <li key={item.path} className="nav-item">
                <Link
                    to={item.path}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
            </li>
        );
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="layout-sidebar" style={{ width: sidebarCollapsed ? '80px' : '260px' }}>
                {/* Header */}
                <div className="sidebar-header" style={{ padding: sidebarCollapsed ? '1.5rem 0.5rem' : '1.5rem' }}>
                    <div className="brand-container" style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
                        {settings?.config.branding.logoUrl ? (
                            <img src={settings.config.branding.logoUrl} alt="Logo" className="brand-logo-img" />
                        ) : (
                            <div className="brand-logo-placeholder">
                                <Building2 size={20} />
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <span className="brand-name">{settings?.name || 'REMIS'}</span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="nav-container">
                    <ul className="nav-list">
                        {baseNavItems.map(renderNavLink)}

                        {MODULE_GROUPS.map((group, idx) => {
                            const activeModules = group.modules.filter(m => {
                                if (m.id === 'properties' || m.id === 'leases') return true;
                                return settings?.features?.[m.id];
                            });
                            if (activeModules.length === 0) return null;

                            const isOpen = openGroups[group.title];

                            return (
                                <React.Fragment key={idx}>
                                    {!sidebarCollapsed ? (
                                        <li
                                            onClick={() => toggleGroup(group.title)}
                                            className="group-header"
                                        >
                                            {group.title}
                                            <ChevronDown
                                                size={14}
                                                style={{
                                                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: 'transform 0.2s'
                                                }}
                                            />
                                        </li>
                                    ) : (
                                        <li className="divider"></li>
                                    )}

                                    {(isOpen || sidebarCollapsed) && activeModules.map(renderNavLink)}
                                </React.Fragment>
                            );
                        })}

                        {/* Settings */}
                        {!sidebarCollapsed && (
                            <li className="group-header" style={{ marginTop: '1rem' }}>
                                Administration
                            </li>
                        )}
                        {sidebarCollapsed && <li className="divider"></li>}
                        {renderNavLink({ path: '/settings', label: 'Settings', icon: Settings })}
                    </ul>
                </nav>

                {/* External Portal */}
                <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <a
                        href="http://localhost:5175"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portal-link"
                        style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                    >
                        <ExternalLink size={18} />
                        {!sidebarCollapsed && <span>Public Portal</span>}
                    </a>
                </div>

                {/* Logout Button */}
                <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                    >
                        <LogOut size={20} />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="collapse-toggle"
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="layout-main">
                {/* Top Header */}
                <header className="top-header">
                    <div className="header-welcome">
                        <h2>Welcome back, {user.fullName?.split(' ')[0] || 'User'}!</h2>
                        <p>{settings?.name || 'Dashboard Overview'}</p>
                    </div>

                    <div className="header-actions">
                        {/* Organization & Multi-Country Switcher */}
                        <div className="org-switcher-container">
                            <button
                                onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                                className="org-switcher-btn"
                                title="Switch Active Organization & Portfolio"
                            >
                                <Building2 size={16} color="#4f46e5" />
                                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                                        {settings?.name || 'Active Organization'}
                                    </div>
                                    <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Globe size={11} /> {settings?.config?.country || 'Global'} • {settings?.config?.locale?.currency || 'USD'}
                                    </div>
                                </div>
                                <ChevronDown size={14} style={{ color: '#94a3b8' }} />
                            </button>

                            {isOrgMenuOpen && (
                                <div className="org-dropdown-menu">
                                    <div className="org-dropdown-header">
                                        <span>Organizations & Portfolios</span>
                                        <span className="org-count-badge">{organizations.length}</span>
                                    </div>
                                    <div className="org-list">
                                        {organizations.map(org => {
                                            const isSelected = org.id === settings?.id || org.id === activeTenantId;
                                            return (
                                                <div
                                                    key={org.id}
                                                    onClick={() => {
                                                        switchOrganization(org.id);
                                                        setIsOrgMenuOpen(false);
                                                    }}
                                                    className={`org-item ${isSelected ? 'selected' : ''}`}
                                                >
                                                    <div className="org-item-info">
                                                        <div className="org-item-name">{org.name}</div>
                                                        <div className="org-item-meta">
                                                            📍 {org.config?.country || 'Global'} • {org._count?.properties || 0} props • {org.config?.locale?.currency || 'USD'}
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check size={16} color="#4f46e5" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="org-dropdown-footer">
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsOrgMenuOpen(false)}
                                            className="add-org-link"
                                        >
                                            <Plus size={14} /> Configure Organizations
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <LiveClock locale={settings?.config?.locale || { dateFormat: 'MM/DD/YYYY', timeFormat: '12h' }} />

                        <div className="user-profile-container" style={{ position: 'relative' }}>
                            <div
                                className="user-profile"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="user-details" style={{ textAlign: 'right' }}>
                                    <span className="user-name">{user.fullName || 'Administrator'}</span>
                                    <span className="user-role">{user.role || 'Super Admin'}</span>
                                </div>
                                <div className="avatar-circle">
                                    {user.fullName ? user.fullName[0].toUpperCase() : 'A'}
                                </div>
                            </div>

                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <button
                                        className="dropdown-item"
                                        onClick={() => {
                                            setShowProfileModal(true);
                                            setIsProfileOpen(false);
                                        }}
                                    >
                                        <User size={16} />
                                        My Profile
                                    </button>
                                    <Link to="/settings" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <Settings size={16} />
                                        Settings
                                    </Link>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="main-content-area">
                    <Outlet />
                </main>
            </div>

            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
            />
        </div>
    );
};

export default Layout;
