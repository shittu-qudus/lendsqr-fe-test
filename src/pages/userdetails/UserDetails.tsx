import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "./Userdetails.module.scss";
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import {
    getCachedUser,
    setCachedUser,
    isCacheStale,
    type CachedUser,
} from '../../components/Usercachedb';

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

interface AccountDetails {
    accountNumber: string | number;
    bank: string;
    tier: number;
    availableBalance: string;
}

export interface UserDetail {
    id: string;
    loanId: string;
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
    accountDetails: AccountDetails;
    isActiveUser: boolean;
    hasLoan: boolean;
    hasSavings: boolean;
    guarantor1: Guarantor;
    guarantor2: Guarantor;
}

type TabKey = 'general' | 'documents' | 'bank' | 'loans' | 'savings' | 'app';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'general', label: 'General Details' },
    { key: 'documents', label: 'Documents' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'loans', label: 'Loans' },
    { key: 'savings', label: 'Savings' },
    { key: 'app', label: 'App and System' },
];

function normaliseUser(raw: Record<string, unknown>): UserDetail {
    const accountDetails = (raw.accountDetails ?? {}) as Record<string, unknown>;
    return {
        id: String(raw.id),
        loanId: String(raw.loanId ?? ''),
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
        accountDetails: {
            accountNumber: String(accountDetails.accountNumber ?? ''),
            bank: String(accountDetails.bank ?? ''),
            tier: Number(accountDetails.tier ?? 1),
            availableBalance: String(accountDetails.availableBalance ?? ''),
        },
        isActiveUser: raw.isActiveUser === true || raw.isActiveUser === 'true',
        hasLoan: raw.hasLoan === true || raw.hasLoan === 'true',
        hasSavings: raw.hasSavings === true || raw.hasSavings === 'true',
        guarantor1: raw.guarantor1 as Guarantor,
        guarantor2: raw.guarantor2 as Guarantor,
    };
}

const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 3 }) => (
    <div className={styles.starRating}>
        {Array.from({ length: max }).map((_, i) => (
            <FiStar key={i} className={i < rating ? styles.starFilled : styles.starEmpty} />
        ))}
    </div>
);

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <dl className={styles.infoField}>
        <dt className={styles.infoLabel}>{label}</dt>
        <dd className={styles.infoValue}>{value}</dd>
    </dl>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className={styles.section}>
        {title && <h2 className={styles.sectionTitle}>{title}</h2>}
        <div className={styles.sectionContent}>{children}</div>
    </section>
);

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
const formatResidence = (type: string) => type.split(' ').map(capitalize).join(' ');
const formatBankName = (bank: string) =>
    bank.charAt(0).toUpperCase() + bank.slice(1).toLowerCase() + ' Bank';

const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('general');

    const fetchFromAPI = useCallback(
        async (userId: string): Promise<UserDetail | null> => {
            try {
                const response = await axios.get<Record<string, unknown>>(
                    `/api/users/${userId}`,
                );
                const normalised = normaliseUser(response.data);
                await setCachedUser<UserDetail>(userId, normalised);
                return normalised;
            } catch {
                return null;
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
                if (isCacheStale(cached.cachedAt)) {
                    const fresh = await fetchFromAPI(userId);
                    if (fresh) setUser(fresh);
                }
                return;
            }

            const fresh = await fetchFromAPI(userId);
            if (fresh) {
                setUser(fresh);
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

    const { accountDetails } = user;

    return (
        <main className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <FiArrowLeft />
                <span>Back to Users</span>
            </button>

            <header className={styles.pageHeader}>
                <h1>User Details</h1>
                <div className={styles.headerActions}>
                    <button className={styles.btnBlacklist}>BLACKLIST USER</button>
                    <button className={styles.btnActivate}>ACTIVATE USER</button>
                </div>
            </header>

            <article className={styles.profileCard}>
                <div className={styles.profileTop}>
                    <div className={styles.avatar}>
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="18" r="9" fill="#adb5bd" />
                            <path d="M6 42c0-9.94 8.06-18 18-18s18 8.06 18 18" fill="#adb5bd" />
                        </svg>
                    </div>
                    <div className={styles.profileInfo}>
                        <h2 className={styles.profileName}>{user.name}</h2>
                        <p className={styles.profileId}>{user.loanId}</p>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.tierInfo}>
                        <p className={styles.tierLabel}>User's Tier</p>
                        <StarRating rating={accountDetails.tier} max={3} />
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.balanceInfo}>
                        <p className={styles.balanceAmount}>{accountDetails.availableBalance}</p>
                        <p className={styles.bankInfo}>
                            {accountDetails.accountNumber}/{formatBankName(accountDetails.bank)}
                        </p>
                    </div>
                </div>

                <nav className={styles.tabs}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </article>

            <div>
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
                            <div className={styles.gridRow}>
                                <InfoField label="MARITAL STATUS" value={capitalize(user.maritalStatus)} />
                                <InfoField label="CHILDREN" value={user.children === 0 ? 'None' : String(user.children)} />
                                <InfoField label="TYPE OF RESIDENCE" value={formatResidence(user.residenceType)} />
                            </div>
                        </Section>

                        <hr className={styles.sectionDivider} />

                        <Section title="Education and Employment">
                            <div className={styles.grid4}>
                                <InfoField label="LEVEL OF EDUCATION" value={capitalize(user.educationLevel)} />
                                <InfoField label="EMPLOYMENT STATUS" value={capitalize(user.employmentStatus)} />
                                <InfoField label="SECTOR OF EMPLOYMENT" value={capitalize(user.sectorOfEmployment)} />
                                <InfoField label="DURATION OF EMPLOYMENT" value={user.durationOfEmployment} />
                            </div>
                            <div className={styles.gridRow}>
                                <InfoField label="OFFICE EMAIL" value={user.officeEmail} />
                                <InfoField label="MONTHLY INCOME" value={user.monthlyIncome} />
                                <InfoField label="LOAN REPAYMENT" value={user.loanRepayment} />
                            </div>
                        </Section>

                        <hr className={styles.sectionDivider} />

                        <Section title="Socials">
                            <div className={styles.grid3}>
                                <InfoField label="TWITTER" value={user.socials.twitter} />
                                <InfoField label="FACEBOOK" value={user.socials.facebook} />
                                <InfoField label="INSTAGRAM" value={user.socials.instagram} />
                            </div>
                        </Section>

                        <hr className={styles.sectionDivider} />

                        <Section title="Guarantor">
                            <div className={styles.grid4}>
                                <InfoField label="FULL NAME" value={user.guarantor1.fullName} />
                                <InfoField label="PHONE NUMBER" value={user.guarantor1.phoneNumber} />
                                <InfoField label="EMAIL ADDRESS" value={user.guarantor1.email} />
                                <InfoField label="RELATIONSHIP" value={capitalize(user.guarantor1.relationship)} />
                            </div>
                        </Section>

                        <hr className={styles.sectionDivider} />

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
        </main>
    );
};

export default UserDetails;