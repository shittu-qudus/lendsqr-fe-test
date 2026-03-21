import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Users.module.scss';
import {
    FiEye,
    FiUserX,
    FiUserCheck as FiUserCheckIcon,
} from 'react-icons/fi';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { useSearch } from '../../context/SearchContext';

// ============ TYPES ============
interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    organization: string;
    date: string;
    status: 'active' | 'inactive' | 'pending' | 'blacklisted';
    isActiveUser: boolean;
    hasLoan: boolean;
    hasSavings: boolean;
}

interface FilterOptions {
    organization: string;
    username: string;
    email: string;
    date: string;
    phoneNumber: string;
    status: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// ============ FILTER COMPONENT ============
interface FilterProps {
    onFilter: (filters: FilterOptions) => void;
    onClose: () => void;
    organizations: string[];
}

const Filter: React.FC<FilterProps> = ({ onFilter, onClose, organizations }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        organization: '',
        username: '',
        email: '',
        date: '',
        phoneNumber: '',
        status: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters: FilterOptions = {
            organization: '',
            username: '',
            email: '',
            date: '',
            phoneNumber: '',
            status: ''
        };
        setFilters(resetFilters);
        onFilter(resetFilters);
        onClose();
    };

    return (
        <div className={styles.filterOverlay} onClick={onClose}>
            <div className={styles.filterContainer} onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className={styles.filterForm}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="organization">Organization</label>
                        <select
                            id="organization"
                            name="organization"
                            value={filters.organization}
                            onChange={handleChange}
                            className={styles.filterSelect}
                        >
                            <option value="">Select</option>
                            {organizations.map(org => (
                                <option key={org} value={org}>{org}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="User"
                            value={filters.username}
                            onChange={handleChange}
                            className={styles.filterInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={filters.email}
                            onChange={handleChange}
                            className={styles.filterInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={filters.date}
                            onChange={handleChange}
                            className={styles.filterInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={filters.phoneNumber}
                            onChange={handleChange}
                            className={styles.filterInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleChange}
                            className={styles.filterSelect}
                        >
                            <option value="">Select</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="blacklisted">Blacklisted</option>
                        </select>
                    </div>

                    <div className={styles.filterButtons}>
                        <button type="button" className={styles.resetButton} onClick={handleReset}>
                            Reset
                        </button>
                        <button type="submit" className={styles.filterButton}>
                            Filter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============ STAT CARD COMPONENT ============
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ backgroundColor: color }}>
            {icon}
        </div>
        <p className={styles.statLabel}>{label}</p>
        <h3 className={styles.statValue}>{value}</h3>
    </div>
);

// ============ MAIN USERS COMPONENT ============
const Users: React.FC = () => {
    const navigate = useNavigate();
    const { searchQuery } = useSearch();

    // State
    const [users, setUsers] = useState<User[]>([]);
    const [columnFilteredUsers, setColumnFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    // Pagination State
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Stats
    const [stats, setStats] = useState({
        totalUsers: '0',
        activeUsers: '0',
        usersWithLoans: '0',
        usersWithSavings: '0'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            const total = users.length;
            const active = users.filter(user => user.isActiveUser === true).length;
            const withLoans = users.filter(user => user.hasLoan === true).length;
            const withSavings = users.filter(user => user.hasSavings === true).length;

            setStats({
                totalUsers: total.toLocaleString(),
                activeUsers: active.toLocaleString(),
                usersWithLoans: withLoans.toLocaleString(),
                usersWithSavings: withSavings.toLocaleString()
            });

            const orgs = [...new Set(users.map(user => user.organization))];
            setOrganizations(orgs);

            setColumnFilteredUsers(users);
        }
    }, [users]);

    // Live search filtering derived from columnFilteredUsers + searchQuery
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return columnFilteredUsers;

        const q = searchQuery.toLowerCase();
        return columnFilteredUsers.filter(user =>
            user.name.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q) ||
            user.phone.includes(q) ||
            user.organization.toLowerCase().includes(q) ||
            user.status.toLowerCase().includes(q)
        );
    }, [searchQuery, columnFilteredUsers]);

    // Keep pagination in sync with filteredUsers
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            currentPage: 1,
            totalItems: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / prev.itemsPerPage)
        }));
    }, [filteredUsers]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/users');

            const userData: User[] = response.data.map((user: Record<string, unknown>) => ({
                id: String(user.id),
                name: String(user.name),
                email: String(user.email),
                phone: String(user.phone),
                organization: String(user.organization),
                date: String(user.date),
                status: user.status as User['status'],
                isActiveUser: user.isActiveUser === true || user.isActiveUser === 'true',
                hasLoan: user.hasLoan === true || user.hasLoan === 'true',
                hasSavings: user.hasSavings === true || user.hasSavings === 'true'
            }));

            setUsers(userData);
            setColumnFilteredUsers(userData);
            setError(null);
        } catch {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    // Column Filter Handler
    const handleFilter = (filters: FilterOptions) => {
        const filtered = users.filter(user => {
            let matches = true;

            if (filters.organization && user.organization !== filters.organization) matches = false;
            if (filters.username && !user.name.toLowerCase().includes(filters.username.toLowerCase())) matches = false;
            if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) matches = false;
            if (filters.phoneNumber && !user.phone.includes(filters.phoneNumber)) matches = false;
            if (filters.status && user.status !== filters.status) matches = false;

            if (filters.date) {
                const userDate = new Date(user.date).toISOString().split('T')[0];
                if (userDate !== filters.date) matches = false;
            }

            return matches;
        });

        setColumnFilteredUsers(filtered);
        setShowFilter(false);
    };

    // Pagination Handlers
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = Number(e.target.value);
        setPagination(prev => ({
            ...prev,
            itemsPerPage: newItemsPerPage,
            totalPages: Math.ceil(filteredUsers.length / newItemsPerPage),
            currentPage: 1
        }));
    };

    const getCurrentPageData = (): User[] => {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const end = start + pagination.itemsPerPage;
        return filteredUsers.slice(start, end);
    };

    const getStatusClass = (status: string): string => {
        switch (status) {
            case 'active': return styles.statusActive;
            case 'pending': return styles.statusPending;
            case 'blacklisted': return styles.statusBlacklisted;
            case 'inactive': return styles.statusInactive;
            default: return '';
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).replace(',', '');
        } catch {
            return dateString;
        }
    };

    const handleViewDetails = (userId: string) => {
        navigate(`/users/${userId}`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={fetchUsers}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.usersContainer}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1>Users</h1>
            </div>

            {/* Stats Grid */}<div className={styles.statsGrid}>
                <StatCard
                    icon={
                        <div className={styles.iconWrap} style={{ backgroundColor: "#fce8ff" }}>
                            <img src="/icons/users.svg" alt="Users" width={28} height={28} />
                        </div>
                    }
                    label="USERS"
                    value={stats.totalUsers}
                    color="#fce8ff"
                />
                <StatCard
                    icon={
                        <div className={styles.iconWrap} style={{ backgroundColor: "#eee8ff" }}>
                            <img src="/icons/active-users.svg" alt="Active Users" width={28} height={28} />
                        </div>
                    }
                    label="ACTIVE USERS"
                    value={stats.activeUsers}
                    color="#eee8ff"
                />
                <StatCard
                    icon={
                        <div className={styles.iconWrap} style={{ backgroundColor: "#feefec" }}>
                            <img src="/icons/loans.svg" alt="Users with Loans" width={28} height={28} />
                        </div>
                    }
                    label="USERS WITH LOANS"
                    value={stats.usersWithLoans}
                    color="#feefec"
                />
                <StatCard
                    icon={
                        <div className={styles.iconWrap} style={{ backgroundColor: "#ffebf0" }}>
                            <img src="/icons/savings.svg" alt="Users with Savings" width={28} height={28} />
                        </div>
                    }
                    label="USERS WITH SAVINGS"
                    value={stats.usersWithSavings}
                    color="#ffebf0"
                />
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>
                                ORGANIZATION
                                <img src="/filter-icon.svg" alt="Filter" className={styles.filterIcon}
                                    onClick={(e) => { e.stopPropagation(); setShowFilter(true); }} />
                            </th>
                            <th>
                                USERNAME
                                <img src="/filter-icon.svg" alt="Filter" className={styles.filterIcon}
                                    onClick={(e) => { e.stopPropagation(); setShowFilter(true); }} />
                            </th>
                            <th>
                                EMAIL
                                <img src="/filter-icon.svg" alt="Filter" className={styles.filterIcon}
                                    onClick={(e) => { e.stopPropagation(); setShowFilter(true); }} />
                            </th>
                            <th>
                                PHONE NUMBER
                                <img src="/filter-icon.svg" alt="Filter" className={styles.filterIcon}
                                    onClick={(e) => { e.stopPropagation(); setShowFilter(true); }} />
                            </th>
                            <th>
                                DATE JOINED
                                <img src="/filter-icon.svg" alt="Filter" className={styles.filterIcon}
                                    onClick={(e) => { e.stopPropagation(); setShowFilter(true); }} />
                            </th>
                            <th>
                                STATUS
                                <img src="/filter-icon.svg" alt="Filter" className={styles.filterIcon}
                                    onClick={(e) => { e.stopPropagation(); setShowFilter(true); }} />
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {getCurrentPageData().length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No users match your search.
                                </td>
                            </tr>
                        ) : (
                            getCurrentPageData().map((user) => (
                                <tr
                                    key={user.id}
                                    className={styles.tableRow}
                                    onClick={() => handleViewDetails(user.id)}
                                >
                                    <td>{user.organization}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{formatDate(user.date)}</td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className={styles.menuCell}>
                                        <button
                                            className={styles.menuButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUser(selectedUser === user.id ? null : user.id);
                                            }}
                                        >
                                            <HiOutlineDotsVertical />
                                        </button>
                                        {selectedUser === user.id && (
                                            <div className={styles.userMenu}>
                                                <button
                                                    className={styles.menuItem}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(user.id);
                                                    }}
                                                >
                                                    <FiEye /> View Details
                                                </button>
                                                <button
                                                    className={styles.menuItem}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FiUserX /> Blacklist User
                                                </button>
                                                <button
                                                    className={styles.menuItem}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FiUserCheckIcon /> Activate User
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        <span>Showing</span>
                        <select value={pagination.itemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>out of {pagination.totalItems}</span>
                    </div>

                    <div className={styles.paginationControls}>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className={styles.paginationArrow}
                        >
                            &lt;
                        </button>

                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            let pageNum = i + 1;
                            if (pagination.currentPage > 3 && pagination.totalPages > 5) {
                                pageNum = pagination.currentPage - 3 + i;
                            }
                            if (pageNum <= pagination.totalPages && pageNum > 0) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`${styles.paginationPage} ${pagination.currentPage === pageNum ? styles.active : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                            <>
                                <span className={styles.paginationEllipsis}>...</span>
                                <button
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    className={styles.paginationPage}
                                >
                                    {pagination.totalPages}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className={styles.paginationArrow}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            {showFilter && (
                <Filter
                    onFilter={handleFilter}
                    onClose={() => setShowFilter(false)}
                    organizations={organizations}
                />
            )}
        </div>
    );
};

export default Users;