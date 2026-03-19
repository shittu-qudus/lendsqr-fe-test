import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './UserDetails.module.scss';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import {
    getCachedUser,
    setCachedUser,
    isCacheStale,
    type CachedUser,
} from '../../components/Usercachedb';

// ============ TYPES ============
interface Guarantor {
    fullName: string;
    phoneNumber: string;
    email: string;
    relationship: string;
}

interface Socials {
    twitter: string;
    facebook: string;
    instagram: string;
}

export interface UserDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    organization: string;
    date: string;
    status: 'active' | 'inactive' | 'pending' | 'blacklisted';
    bvn: string;
    gender: string;
    maritalStatus: string;
    residenceType: string;
    children: number;
    educationLevel: string;
    employmentStatus: string;
    sectorOfEmployment: string;
    durationOfEmployment: string;
    officeEmail: string;
    monthlyIncome: string;
    loanRepayment: string;
    socials: Socials;
    isActiveUser: boolean;
    hasLoan: boolean;
    hasSavings: boolean;
    guarantor1: Guarantor;
    guarantor2: Guarantor;
}

type TabKey = 'general' | 'documents' | 'bank' | 'loans' | 'savings' | 'app';
type CacheStatus = 'fresh' | 'stale' | 'none';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'general', label: 'General Details' },
    { key: 'documents', label: 'Documents' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'loans', label: 'Loans' },
    { key: 'savings', label: 'Savings' },
    { key: 'app', label: 'App and System' },
];

// ============ NORMALISE RAW API RESPONSE ============
function normaliseUser(raw: Record<string, unknown>): UserDetail {
    return {
        id: String(raw.id),
        name: String(raw.name),
        email: String(raw.email),
        phone: String(raw.phone),
        organization: String(raw.organization),
        date: String(raw.date),
        status: raw.status as UserDetail['status'],
        bvn: String(raw.bvn),
        gender: String(raw.gender),
        maritalStatus: String(raw.maritalStatus),
        residenceType: String(raw.residenceType),
        children: Number(raw.children),
        educationLevel: String(raw.educationLevel),
        employmentStatus: String(raw.employmentStatus),
        sectorOfEmployment: String(raw.sectorOfEmployment),
        durationOfEmployment: String(raw.durationOfEmployment),
        officeEmail: String(raw.officeEmail),
        monthlyIncome: String(raw.monthlyIncome),
        loanRepayment: String(raw.loanRepayment),
        socials: raw.socials as Socials,
        isActiveUser: raw.isActiveUser === true || raw.isActiveUser === 'true',
        hasLoan: raw.hasLoan === true || raw.hasLoan === 'true',
        hasSavings: raw.hasSavings === true || raw.hasSavings === 'true',
        guarantor1: raw.guarantor1 as Guarantor,
        guarantor2: raw.guarantor2 as Guarantor,
    };
}

// ============ SUB-COMPONENTS ============
const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 3 }) => (
    <div className={styles.starRating}>
        {Array.from({ length: max }).map((_, i) => (
            <FiStar key={i} className={i < rating ? styles.starFilled : styles.starEmpty} />
        ))}
    </div>
);

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className={styles.infoField}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className={styles.section}>
        {title && <h3 className={styles.sectionTitle}>{title}</h3>}
        <div className={styles.sectionContent}>{children}</div>
    </div>
);

const CacheBadge: React.FC<{ status: CacheStatus; revalidating: boolean }> = ({
    status,
    revalidating,
}) => {
    if (status === 'none') return null;
    const label = revalidating ? '↻ Refreshing' : status === 'fresh' ? '✓ Cached' : '⚠ Stale';
    const cls = revalidating
        ? styles.cacheBadgeRevalidating
        : status === 'fresh'
            ? styles.cacheBadgeFresh
            : styles.cacheBadgeStale;
    return <span className={`${styles.cacheBadge} ${cls}`}>{label}</span>;
};

// ============ MAIN COMPONENT ============
const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('general');
    const [cacheStatus, setCacheStatus] = useState<CacheStatus>('none');
    const [revalidating, setRevalidating] = useState<boolean>(false);

    const fetchFromAPI = useCallback(
        async (userId: string, isBackground: boolean): Promise<UserDetail | null> => {
            try {
                if (isBackground) setRevalidating(true);
                const response = await axios.get<Record<string, unknown>>(
                    `http://localhost:3001/users/${userId}`,
                );
                const normalised = normaliseUser(response.data);
                await setCachedUser<UserDetail>(userId, normalised);
                return normalised;
            } catch {
                return null;
            } finally {
                if (isBackground) setRevalidating(false);
            }
        },
        [],
    );

    const loadUser = useCallback(
        async (userId: string) => {
            setLoading(true);
            setError(null);

            const cached: CachedUser<UserDetail> | null = await getCachedUser<UserDetail>(userId);

            if (cached) {
                setUser(cached.data);
                setLoading(false);
                const stale = isCacheStale(cached.cachedAt);
                setCacheStatus(stale ? 'stale' : 'fresh');
                if (stale) {
                    const fresh = await fetchFromAPI(userId, true);
                    if (fresh) { setUser(fresh); setCacheStatus('fresh'); }
                }
                return;
            }

            const fresh = await fetchFromAPI(userId, false);
            if (fresh) {
                setUser(fresh);
                setCacheStatus('fresh');
            } else {
                setError('Failed to load user details. Please check your connection and try again.');
            }
            setLoading(false);
        },
        [fetchFromAPI],
    );

    useEffect(() => {
        if (id !== undefined) loadUser(id);
    }, [id, loadUser]);

    const handleForceRefresh = async () => {
        if (!id) return;
        const fresh = await fetchFromAPI(id, true);
        if (fresh) { setUser(fresh); setCacheStatus('fresh'); }
    };

    const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    const formatResidence = (type: string) => type.split(' ').map(capitalize).join(' ');

    // ---- Loading & error states — still need the shell so layout doesn't flash ----
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader} />
                <p>Loading user details…</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className={styles.errorContainer}>
                <p>{error ?? 'User not found'}</p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    // ---- Render: success ----
    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <FiArrowLeft />
                <span>Back to Users</span>
            </button>

            <div className={styles.pageHeader}>
                <h1>User Details</h1>
                <div className={styles.headerActions}>
                    <CacheBadge status={cacheStatus} revalidating={revalidating} />
                    <button
                        className={styles.btnRefresh}
                        onClick={handleForceRefresh}
                        disabled={revalidating}
                        title="Force refresh from server"
                    >
                        ↻
                    </button>
                    <button className={styles.btnBlacklist}>BLACKLIST USER</button>
                    <button className={styles.btnActivate}>ACTIVATE USER</button>
                </div>
            </div>

            <div className={styles.profileCard}>
                <div className={styles.profileTop}>
                    <div className={styles.avatar}>
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="18" r="9" fill="#adb5bd" />
                            <path d="M6 42c0-9.94 8.06-18 18-18s18 8.06 18 18" fill="#adb5bd" />
                        </svg>
                    </div>
                    <div className={styles.profileInfo}>
                        <h2 className={styles.profileName}>{user.name}</h2>
                        <p className={styles.profileId}>LSQFf{user.id}g90</p>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.tierInfo}>
                        <p className={styles.tierLabel}>User&apos;s Tier</p>
                        <StarRating rating={1} max={3} />
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.balanceInfo}>
                        <p className={styles.balanceAmount}>₦200,000.00</p>
                        <p className={styles.bankInfo}>9912345678/Providus Bank</p>
                    </div>
                </div>

                <div className={styles.tabs}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'general' && (
                <div className={styles.detailsCard}>
                    <Section title="Personal Information">
                        <div className={styles.grid5}>
                            <InfoField label="FULL NAME" value={user.name} />
                            <InfoField label="PHONE NUMBER" value={user.phone} />
                            <InfoField label="EMAIL ADDRESS" value={user.email} />
                            <InfoField label="BVN" value={String(user.bvn)} />
                            <InfoField label="GENDER" value={capitalize(user.gender)} />
                        </div>
                        <div className={styles.grid3}>
                            <InfoField label="MARITAL STATUS" value={capitalize(user.maritalStatus)} />
                            <InfoField
                                label="CHILDREN"
                                value={user.children === 0 ? 'None' : String(user.children)}
                            />
                            <InfoField label="TYPE OF RESIDENCE" value={formatResidence(user.residenceType)} />
                        </div>
                    </Section>

                    <div className={styles.sectionDivider} />

                    <Section title="Education and Employment">
                        <div className={styles.grid4}>
                            <InfoField label="LEVEL OF EDUCATION" value={capitalize(user.educationLevel)} />
                            <InfoField label="EMPLOYMENT STATUS" value={capitalize(user.employmentStatus)} />
                            <InfoField label="SECTOR OF EMPLOYMENT" value={capitalize(user.sectorOfEmployment)} />
                            <InfoField label="DURATION OF EMPLOYMENT" value={user.durationOfEmployment} />
                        </div>
                        <div className={styles.grid3}>
                            <InfoField label="OFFICE EMAIL" value={user.officeEmail} />
                            <InfoField label="MONTHLY INCOME" value={user.monthlyIncome} />
                            <InfoField label="LOAN REPAYMENT" value={user.loanRepayment} />
                        </div>
                    </Section>

                    <div className={styles.sectionDivider} />

                    <Section title="Socials">
                        <div className={styles.grid3}>
                            <InfoField label="TWITTER" value={user.socials.twitter} />
                            <InfoField label="FACEBOOK" value={user.socials.facebook} />
                            <InfoField label="INSTAGRAM" value={user.socials.instagram} />
                        </div>
                    </Section>

                    <div className={styles.sectionDivider} />

                    <Section title="Guarantor">
                        <div className={styles.grid4}>
                            <InfoField label="FULL NAME" value={user.guarantor1.fullName} />
                            <InfoField label="PHONE NUMBER" value={user.guarantor1.phoneNumber} />
                            <InfoField label="EMAIL ADDRESS" value={user.guarantor1.email} />
                            <InfoField label="RELATIONSHIP" value={capitalize(user.guarantor1.relationship)} />
                        </div>
                    </Section>

                    <div className={styles.sectionDivider} />

                    <Section title="">
                        <div className={styles.grid4}>
                            <InfoField label="FULL NAME" value={user.guarantor2.fullName} />
                            <InfoField label="PHONE NUMBER" value={user.guarantor2.phoneNumber} />
                            <InfoField label="EMAIL ADDRESS" value={user.guarantor2.email} />
                            <InfoField label="RELATIONSHIP" value={capitalize(user.guarantor2.relationship)} />
                        </div>
                    </Section>
                </div>
            )}

            {activeTab !== 'general' && (
                <div className={styles.detailsCard}>
                    <div className={styles.emptyTab}>
                        <p>No {TABS.find((t) => t.key === activeTab)?.label} data available.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;