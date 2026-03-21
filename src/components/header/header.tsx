import React, { useState } from 'react';
import styles from './Header.module.scss';
import {
    FiSearch,
    FiBell,
    FiChevronDown
} from 'react-icons/fi';
import { HiOutlineMenu } from 'react-icons/hi';
import { useSearch } from '../../context/SearchContext';

// Types defined directly in the component file
interface User {
    name: string;
    avatar?: string;
}

interface HeaderProps {
    user?: User;
    onDocsClick?: () => void;
    onNotificationClick?: () => void;
    onProfileClick?: () => void;
}

// Default user if none provided
const defaultUser: User = {
    name: 'Adedeji',
    avatar: '/userImage.png'
};

const Header: React.FC<HeaderProps> = ({
    user = defaultUser,
    onDocsClick,
    onNotificationClick,
    onProfileClick
}) => {
    const { searchQuery, setSearchQuery } = useSearch();
    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    const handleProfileClick = () => {
        setIsProfileOpen(!isProfileOpen);
        if (onProfileClick) {
            onProfileClick();
        }
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                {/* Logo Section */}
                <div className={styles.logoSection}>
                    <img
                        src="/logo.png" alt="Lendsqr"
                        className={styles.logo}
                    />
                </div>

                {/* Search Section - Desktop */}
                <div className={styles.searchSection}>
                    <div className={styles.searchForm}>
                        <input
                            type="text"
                            placeholder="Search for anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                            aria-label="Search"
                        />
                        <button type="button" className={styles.searchButton} aria-label="Search">
                            <FiSearch className={styles.searchIcon} />
                        </button>
                    </div>
                </div>

                {/* Actions Section */}
                <div className={styles.actionsSection}>
                    <button
                        className={styles.docsLink}
                        onClick={onDocsClick}
                    >
                        Docs
                    </button>

                    <button
                        className={styles.notificationButton}
                        onClick={onNotificationClick}
                        aria-label="Notifications"
                    >
                        <FiBell className={styles.notificationIcon} />
                    </button>

                    <div className={styles.profileSection}>
                        <button
                            className={styles.profileButton}
                            onClick={handleProfileClick}
                            aria-expanded={isProfileOpen}
                            aria-haspopup="true"
                        >
                            <div className={styles.avatarWrapper}>
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.profileInfo}>
                                <span className={styles.userName}>{user.name}</span>
                                <FiChevronDown
                                    className={`${styles.dropdownIcon} ${isProfileOpen ? styles.rotated : ''}`}
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className={styles.dropdownMenu}>
                                <ul className={styles.dropdownList}>
                                    <li>
                                        <button className={styles.dropdownItem}>Profile</button>
                                    </li>
                                    <li>
                                        <button className={styles.dropdownItem}>Settings</button>
                                    </li>
                                    <li>
                                        <button className={styles.dropdownItem}>Logout</button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.mobileMenuButton}
                    onClick={handleMobileMenuToggle}
                    aria-label="Menu"
                >
                    <HiOutlineMenu className={styles.menuIcon} />
                </button>
            </div>

            {/* Mobile Search Menu */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileSearch}>
                        <div className={styles.mobileSearchForm}>
                            <input
                                type="text"
                                placeholder="Search for anything"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.mobileSearchInput}
                            />
                            <button type="button" className={styles.mobileSearchButton}>
                                <FiSearch className={styles.mobileSearchIcon} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;