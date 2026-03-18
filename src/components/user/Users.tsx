import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Users.module.scss';
import {
    FiUsers,
    FiUserCheck,
    FiEye,
    FiUserX,
    FiUserCheck as FiUserCheckIcon,
} from 'react-icons/fi';
import { BsPiggyBank } from 'react-icons/bs';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { HiOutlineDotsVertical } from 'react-icons/hi';

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

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // Show 9 rows like in the image

    // Mock data for stats (you can replace with real data)
    const stats = [
        { icon: <FiUsers />, label: 'USERS', value: '2,453', color: '#fce8ff' },
        { icon: <FiUserCheck />, label: 'ACTIVE USERS', value: '2,453', color: '#eee8ff' },
        { icon: <BsPiggyBank />, label: 'USERS WITH LOANS', value: '12,453', color: '#feefec' },
        { icon: <MdOutlineAccountBalanceWallet />, label: 'USERS WITH SAVINGS', value: '102,453', color: '#ffebf0' }
    ];

    // Mock data for users
    const mockUsers = [
        { id: '1', organization: 'Lendsqr', name: 'Adedeji', email: 'adedeji@lendsqr.com', phone: '08078903721', date: 'May 15, 2020 10:00 AM', status: 'inactive' },
        { id: '2', organization: 'Irorun', name: 'Debby Ogana', email: 'debby2@irorun.com', phone: '08160780928', date: 'Apr 30, 2020 10:00 AM', status: 'pending' },
        { id: '3', organization: 'Lendstar', name: 'Grace Effiom', email: 'grace@lendstar.com', phone: '07060780922', date: 'Apr 30, 2020 10:00 AM', status: 'blacklisted' },
        { id: '4', organization: 'Lendsqr', name: 'Tosin Dokunmu', email: 'tosin@lendsqr.com', phone: '07003309226', date: 'Apr 10, 2020 10:00 AM', status: 'pending' },
        { id: '5', organization: 'Lendstar', name: 'Grace Effiom', email: 'grace@lendstar.com', phone: '07060780922', date: 'Apr 30, 2020 10:00 AM', status: 'active' },
        { id: '6', organization: 'Lendsqr', name: 'Tosin Dokunmu', email: 'tosin@lendsqr.com', phone: '08060780900', date: 'Apr 10, 2020 10:00 AM', status: 'active' },
        { id: '7', organization: 'Lendstar', name: 'Grace Effiom', email: 'grace@lendstar.com', phone: '07060780922', date: 'Apr 30, 2020 10:00 AM', status: 'blacklisted' },
        { id: '8', organization: 'Lendsqr', name: 'Tosin Dokunmu', email: 'tosin@lendsqr.com', phone: '08060780900', date: 'Apr 10, 2020 10:00 AM', status: 'inactive' },
        { id: '9', organization: 'Lendstar', name: 'Grace Effiom', email: 'grace@lendstar.com', phone: '07060780922', date: 'Apr 30, 2020 10:00 AM', status: 'inactive' }
    ];

    useEffect(() => {
        // Use mock data directly
        setUsers(mockUsers as User[]);
        setFilteredUsers(mockUsers as User[]);
        setLoading(false);
    }, []);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return styles.statusActive;
            case 'pending': return styles.statusPending;
            case 'blacklisted': return styles.statusBlacklisted;
            default: return styles.statusInactive;
        }
    };

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <div className={styles.usersContainer}>
            {/* Stats Cards - Small boxes */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statLabel}>{stat.label}</div>
                        <div className={styles.statValue}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Users Table - Compact */}
            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>ORGANIZATION <img src="/filter-icon.svg" className={styles.filterIcon} onClick={() => setShowFilter(true)} /></th>
                            <th>USERNAME <img src="/filter-icon.svg" className={styles.filterIcon} onClick={() => setShowFilter(true)} /></th>
                            <th>EMAIL <img src="/filter-icon.svg" className={styles.filterIcon} onClick={() => setShowFilter(true)} /></th>
                            <th>PHONE NUMBER <img src="/filter-icon.svg" className={styles.filterIcon} onClick={() => setShowFilter(true)} /></th>
                            <th>DATE JOINED <img src="/filter-icon.svg" className={styles.filterIcon} onClick={() => setShowFilter(true)} /></th>
                            <th>STATUS <img src="/filter-icon.svg" className={styles.filterIcon} onClick={() => setShowFilter(true)} /></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.organization}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.date}</td>
                                <td>
                                    <span className={`${styles.status} ${getStatusClass(user.status)}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className={styles.menuCell}>
                                    <button className={styles.menuButton} onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}>
                                        <HiOutlineDotsVertical />
                                    </button>
                                    {selectedUser === user.id && (
                                        <div className={styles.userMenu}>
                                            <button className={styles.menuItem}><FiEye /> View Details</button>
                                            <button className={styles.menuItem}><FiUserX /> Blacklist User</button>
                                            <button className={styles.menuItem}><FiUserCheckIcon /> Activate User</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination - Small */}
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        <span>Showing</span>
                        <span>100 out of 100</span>
                    </div>
                    <div className={styles.paginationControls}>
                        <button className={styles.paginationArrow} disabled>&lt;</button>
                        <button className={`${styles.paginationPage} ${styles.active}`}>1</button>
                        <button className={styles.paginationPage}>2</button>
                        <button className={styles.paginationPage}>3</button>
                        <span className={styles.paginationEllipsis}>...</span>
                        <button className={styles.paginationPage}>15</button>
                        <button className={styles.paginationPage}>16</button>
                        <button className={styles.paginationArrow}>&gt;</button>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            {showFilter && (
                <div className={styles.filterOverlay} onClick={() => setShowFilter(false)}>
                    <div className={styles.filterContainer} onClick={e => e.stopPropagation()}>
                        <form className={styles.filterForm}>
                            <div className={styles.filterGroup}>
                                <label>Organization</label>
                                <select className={styles.filterSelect}>
                                    <option>Select</option>
                                    <option>Lendsqr</option>
                                    <option>Irorun</option>
                                    <option>Lendstar</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Username</label>
                                <input type="text" placeholder="User" className={styles.filterInput} />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Email</label>
                                <input type="email" placeholder="Email" className={styles.filterInput} />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Date</label>
                                <input type="date" className={styles.filterInput} />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Phone Number</label>
                                <input type="tel" placeholder="Phone Number" className={styles.filterInput} />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Status</label>
                                <select className={styles.filterSelect}>
                                    <option>Select</option>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                    <option>Pending</option>
                                    <option>Blacklisted</option>
                                </select>
                            </div>
                            <div className={styles.filterButtons}>
                                <button type="button" className={styles.resetButton}>Reset</button>
                                <button type="submit" className={styles.filterButton}>Filter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;