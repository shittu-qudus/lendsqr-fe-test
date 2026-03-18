import React, { useState } from 'react';
import styles from './Sidebar.module.scss';
import {
    FiHome,
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiBriefcase,
    FiDollarSign,
    FiCreditCard,
    FiFileText,
    FiSettings,
    FiLogOut,
    FiChevronDown,
    FiStar,
    FiShield,
    FiSliders,
    FiPieChart,
    FiPercent
} from 'react-icons/fi';
import {
    BsPeople,
    BsPersonBadge,
    BsGraphUp,
    BsPiggyBank,
    BsBank,
    BsReceipt,
    BsGear,
    BsBookmarkCheck,
    BsBookmarkX
} from 'react-icons/bs';
import {
    RiHandCoinLine,
    RiExchangeFundsLine,
    RiUserStarLine,
    RiUserSettingsLine
} from 'react-icons/ri';
import {
    MdOutlineBusinessCenter,
    MdOutlineSavings,
    MdOutlineAccountBalance,
    MdOutlineRealEstateAgent,
    MdOutlineReportGmailerrorred
} from 'react-icons/md';
import { TbReportAnalytics } from 'react-icons/tb';
import { GiTakeMyMoney } from 'react-icons/gi';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onLogout?: () => void;
    activeItem?: string;
    onNavigate?: (path: string) => void;
}

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    path?: string;
    badge?: string | number;
}

interface MenuSection {
    title?: string;
    items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen = true,
    onClose,
    onLogout,
    activeItem = 'Users',
    onNavigate
}) => {
    const [isOrganizationOpen, setIsOrganizationOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const handleNavigation = (path: string, label: string) => {
        if (onNavigate) {
            onNavigate(path);
        }
        console.log(`Navigating to: ${label}`);
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        console.log('Logging out...');
    };

    const menuSections: MenuSection[] = [
        {
            title: 'CUSTOMERS',
            items: [
                { icon: <FiUsers />, label: 'Users', path: '/users' },
                { icon: <BsPeople />, label: 'Guarantors', path: '/guarantors' },
                { icon: <GiTakeMyMoney />, label: 'Loans', path: '/loans' },
                { icon: <RiHandCoinLine />, label: 'Decision Models', path: '/decision-models' },
                { icon: <MdOutlineSavings />, label: 'Savings', path: '/savings' },
                { icon: <RiExchangeFundsLine />, label: 'Loan Requests', path: '/loan-requests' },
                { icon: <FiUserCheck />, label: 'Whitelist', path: '/whitelist' },
                { icon: <FiUserX />, label: 'Karma', path: '/karma' }
            ]
        },
        {
            title: 'BUSINESSES',
            items: [
                { icon: <MdOutlineBusinessCenter />, label: 'Organization', path: '/organization' },
                { icon: <RiHandCoinLine />, label: 'Loan Products', path: '/loan-products' },
                { icon: <BsPiggyBank />, label: 'Savings Products', path: '/savings-products' },
                { icon: <BsReceipt />, label: 'Fees and Charges', path: '/fees-and-charges' },
                { icon: <RiExchangeFundsLine />, label: 'Transactions', path: '/transactions' },
                { icon: <FiSettings />, label: 'Services', path: '/services' },
                { icon: <MdOutlineAccountBalance />, label: 'Service Account', path: '/service-account' },
                { icon: <MdOutlineRealEstateAgent />, label: 'Settlements', path: '/settlements' },
                { icon: <TbReportAnalytics />, label: 'Reports', path: '/reports' }
            ]
        },
        {
            title: 'SETTINGS',
            items: [
                { icon: <FiSliders />, label: 'Preferences', path: '/preferences' },
                { icon: <FiPercent />, label: 'Fees and Pricing', path: '/fees-and-pricing' },
                { icon: <FiShield />, label: 'Audit Logs', path: '/audit-logs' },
                { icon: <FiFileText />, label: 'Systems Messages', path: '/systems-messages' }
            ]
        }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && <div className={styles.overlay} onClick={onClose} />}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarContent}>
                    {/* Switch Organization */}
                    <div className={styles.organizationSwitch}>
                        <MdOutlineBusinessCenter className={styles.orgIcon} />
                        <span className={styles.orgText}>Switch Organization</span>
                        <FiChevronDown className={styles.dropdownIcon} />
                    </div>

                    {/* Dashboard Link */}
                    <div className={styles.dashboardLink}>
                        <FiHome className={styles.dashboardIcon} />
                        <span className={styles.dashboardText}>Dashboard</span>
                    </div>

                    {/* Menu Sections */}
                    <div className={styles.menuSections}>
                        {menuSections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className={styles.menuSection}>
                                {section.title && (
                                    <h3 className={styles.sectionTitle}>{section.title}</h3>
                                )}
                                <ul className={styles.menuList}>
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex}>
                                            <button
                                                className={`${styles.menuItem} ${activeItem === item.label ? styles.active : ''}`}
                                                onClick={() => handleNavigation(item.path || '', item.label)}
                                            >
                                                <span className={styles.menuIcon}>{item.icon}</span>
                                                <span className={styles.menuLabel}>{item.label}</span>
                                                {item.badge && (
                                                    <span className={styles.menuBadge}>{item.badge}</span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Pagination for Settings */}
                    <div className={styles.settingsPagination}>
                        <div className={styles.paginationInfo}>
                            <span className={styles.paginationLabel}>SETTINGS</span>
                            <span className={styles.paginationNumbers}>1 2 3 ... 15</span>
                        </div>
                        <button className={styles.paginationButton}>
                            <FiChevronDown className={styles.paginationIcon} />
                        </button>
                    </div>

                    {/* Logout Button */}
                    <div className={styles.logoutSection}>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            <FiLogOut className={styles.logoutIcon} />
                            <span className={styles.logoutText}>Logout</span>
                        </button>
                        <p className={styles.versionText}>v1.2.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;