import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import { FiX, FiMenu } from 'react-icons/fi';

// ============ TYPES ============
interface MenuItem {
    icon: string;
    label: string;
    path: string;
    badge?: string | number;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

interface SidebarProps {
    onLogout?: () => void;
}

// ============ MENU DATA ============
const menuSections: MenuSection[] = [
    {
        title: 'CUSTOMERS',
        items: [
            { icon: '/icons/user.svg', label: 'Users', path: '/user' },
            { icon: '/icons/guarantors.svg', label: 'Guarantors', path: '/guarantors' },
            { icon: '/icons/loan.svg', label: 'Loans', path: '/loans' },
            { icon: '/icons/decision-models.svg', label: 'Decision Models', path: '/decision-models' },
            { icon: '/icons/saving.svg', label: 'Savings', path: '/savings' },
            { icon: '/icons/loan-requests.svg', label: 'Loan Requests', path: '/loan-requests' },
            { icon: '/icons/whitelist.svg', label: 'Whitelist', path: '/whitelist' },
            { icon: '/icons/karma.svg', label: 'Karma', path: '/karma' },
        ],
    },
    {
        title: 'BUSINESSES',
        items: [
            { icon: '/icons/organization.svg', label: 'Organization', path: '/organization' },
            { icon: '/icons/loan-products.svg', label: 'Loan Products', path: '/loan-products' },
            { icon: '/icons/savings-products.svg', label: 'Savings Products', path: '/savings-products' },
            { icon: '/icons/fees.svg', label: 'Fees and Charges', path: '/fees-and-charges' },
            { icon: '/icons/transactions.svg', label: 'Transactions', path: '/transactions' },
            { icon: '/icons/services.svg', label: 'Services', path: '/services' },
            { icon: '/icons/service-account.svg', label: 'Service Account', path: '/service-account' },
            { icon: '/icons/settlements.svg', label: 'Settlements', path: '/settlements' },
            { icon: '/icons/reports.svg', label: 'Reports', path: '/reports' },
        ],
    },
    {
        title: 'SETTINGS',
        items: [
            { icon: '/icons/preferences.svg', label: 'Preferences', path: '/preferences' },
            { icon: '/icons/pricing.svg', label: 'Fees and Pricing', path: '/fees-and-pricing' },
            { icon: '/icons/audit.svg', label: 'Audit Logs', path: '/audit-logs' },
            { icon: '/icons/messages.svg', label: 'Systems Messages', path: '/systems-messages' },
        ],
    },
];

// ============ COMPONENT ============
const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const handleNavigate = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    const handleLogout = useCallback(() => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('token');
            navigate('/', { replace: true });
        }
    }, [onLogout, navigate]);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* ── Hamburger (mobile) ── */}
            <button
                className={styles.hamburger}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="main-sidebar"
                onClick={() => setMobileOpen(prev => !prev)}
            >
                {mobileOpen
                    ? <FiX className={styles.icon} aria-hidden="true" />
                    : <FiMenu className={styles.icon} aria-hidden="true" />
                }
            </button>

            {/* ── Backdrop overlay (mobile) ── */}
            {mobileOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ── */}
            <nav
                id="main-sidebar"
                className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}
                aria-label="Main navigation"
            >
                <div className={styles.sidebarContent}>

                    {/* Switch Organization */}
                    <button className={styles.organizationSwitch} aria-label="Switch organization">
                        <img src="/icons/organization.svg" alt="" className={styles.orgIcon} />
                        <span className={styles.orgText}>Switch Organization</span>
                        <img src="/icons/dropdown.svg" alt="" className={styles.dropdownIcon} />
                    </button>

                    {/* Dashboard */}
                    <button
                        className={`${styles.dashboardLink} ${isActive('/dashboard') ? styles.active : ''}`}
                        onClick={() => handleNavigate('/dashboard')}
                        aria-current={isActive('/dashboard') ? 'page' : undefined}
                    >
                        <img src="/icons/home.svg" alt="" className={styles.dashboardIcon} />
                        <span className={styles.dashboardText}>Dashboard</span>
                    </button>

                    {/* Menu Sections */}
                    <div className={styles.menuSections}>
                        {menuSections.map(section => (
                            <section key={section.title} aria-label={section.title}>
                                <p className={styles.sectionTitle}>{section.title}</p>
                                <ul className={styles.menuList} role="list">
                                    {section.items.map(item => (
                                        <li key={item.path}>
                                            <button
                                                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                                                onClick={() => handleNavigate(item.path)}
                                                aria-current={isActive(item.path) ? 'page' : undefined}
                                            >
                                                <img src={item.icon} alt="" className={styles.menuIconImg} />
                                                <span className={styles.menuLabel}>{item.label}</span>
                                                {item.badge !== undefined && (
                                                    <span className={styles.menuBadge} aria-label={`${item.badge} notifications`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {/* Logout */}
                    <footer className={styles.logoutSection}>
                        <button className={styles.logoutButton} onClick={handleLogout} aria-label="Logout">
                            <img src="/icons/logout.svg" alt="" className={styles.logoutIcon} />
                            <span className={styles.logoutText}>Logout</span>
                        </button>
                        <p className={styles.versionText}>v1.2.0</p>
                    </footer>

                </div>
            </nav>
        </>
    );
};

export default Sidebar;