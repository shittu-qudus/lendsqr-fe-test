import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserDetails from './UserDetails';
import '@testing-library/jest-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios);

vi.mock('../../components/Usercachedb', () => ({
    getCachedUser: vi.fn().mockResolvedValue(null),
    setCachedUser: vi.fn().mockResolvedValue(undefined),
    isCacheStale: vi.fn().mockReturnValue(false),
}));

// ─── Fixture ──────────────────────────────────────────────────────────────────
const mockUser = {
    id: '1',
    loanId: 'LSQFf587g90',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '08012345678',
    organization: 'Lendsqr',
    date: '2021-01-01',
    status: 'active',
    bvn: '12345678901',
    gender: 'male',
    maritalStatus: 'single',
    residenceType: 'parent apartment',
    children: 0,
    educationLevel: 'bsc',
    employmentStatus: 'employed',
    sectorOfEmployment: 'fintech',
    durationOfEmployment: '2 years',
    officeEmail: 'john.work@example.com',
    monthlyIncome: '₦200,000',
    loanRepayment: '₦40,000',
    socials: { twitter: '@john', facebook: 'john.fb', instagram: '@john_ig' },
    accountDetails: {
        accountNumber: '0123456789',
        bank: 'sterling',
        tier: 2,
        availableBalance: '₦200,000.00',
    },
    isActiveUser: true,
    hasLoan: false,
    hasSavings: true,
    guarantor1: { fullName: 'Jane Doe', phoneNumber: '08011111111', email: 'jane@example.com', relationship: 'sister' },
    guarantor2: { fullName: 'Jack Doe', phoneNumber: '08022222222', email: 'jack@example.com', relationship: 'brother' },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const renderUserDetails = () =>
    render(
        <MemoryRouter initialEntries={['/users/1']}>
            <Routes>
                <Route path="/users/:id" element={<UserDetails />} />
            </Routes>
        </MemoryRouter>
    );

// wait for the profile name heading to confirm user has loaded
const waitForUser = () =>
    screen.findByRole('heading', { name: 'John Doe' });

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('UserDetails Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        mockedAxios.get = vi.fn().mockResolvedValue({ data: mockUser });
    });

    // ── Rendering ───────────────────────────────────────────────────────────────
    describe('Rendering', () => {
        it('shows loading state initially', () => {
            renderUserDetails();
            expect(screen.getByText(/loading user details/i)).toBeInTheDocument();
        });

        it('does NOT show user content while loading', () => {
            renderUserDetails();
            expect(screen.queryByRole('main')).not.toBeInTheDocument();
        });
    });

    // ── User Data ────────────────────────────────────────────────────────────────
    describe('User Data', () => {
        it('renders user name, loan ID and email after load', async () => {
            renderUserDetails();
            await waitForUser();
            expect(screen.getByText('LSQFf587g90')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('does NOT show error message when user loads successfully', async () => {
            renderUserDetails();
            await waitForUser();
            expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
        });
    });

    // ── Error State ──────────────────────────────────────────────────────────────
    describe('Error State', () => {
        it('shows error message when API call fails', async () => {
            mockedAxios.get = vi.fn().mockRejectedValue(new Error('Network Error'));
            renderUserDetails();
            expect(await screen.findByText(/failed to load user details/i)).toBeInTheDocument();
        });

        it('does NOT show user content when API fails', async () => {
            mockedAxios.get = vi.fn().mockRejectedValue(new Error('Network Error'));
            renderUserDetails();
            await screen.findByText(/failed to load user details/i);
            expect(screen.queryByRole('heading', { name: 'John Doe' })).not.toBeInTheDocument();
        });
    });

    // ── Tabs ─────────────────────────────────────────────────────────────────────
    describe('Tabs', () => {
        it('renders all 6 tab buttons', async () => {
            renderUserDetails();
            await waitForUser();
            ['General Details', 'Documents', 'Bank Details', 'Loans', 'Savings', 'App and System'].forEach((label) => {
                expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
            });
        });

        it('does NOT show empty tab message when General Details is active', async () => {
            renderUserDetails();
            await waitForUser();
            expect(screen.queryByText(/no general details data available/i)).not.toBeInTheDocument();
        });
    });

    // ── Tab Switching ────────────────────────────────────────────────────────────
    describe('Tab Switching', () => {
        it('shows empty state message when a non-general tab is clicked', async () => {
            renderUserDetails();
            await waitForUser();
            await userEvent.click(screen.getByRole('button', { name: 'Documents' }));
            expect(screen.getByText(/no documents data available/i)).toBeInTheDocument();
        });

        it('does NOT show Personal Information section after switching tabs', async () => {
            renderUserDetails();
            await waitForUser();
            await userEvent.click(screen.getByRole('button', { name: 'Loans' }));
            expect(screen.queryByRole('heading', { name: /personal information/i })).not.toBeInTheDocument();
        });
    });

    // ── Navigation ───────────────────────────────────────────────────────────────
    describe('Navigation', () => {
        it('calls navigate(-1) when Back to Users is clicked', async () => {
            renderUserDetails();
            await waitForUser();
            await userEvent.click(screen.getByRole('button', { name: /back to users/i }));
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });

        it('does NOT navigate on initial render without user interaction', async () => {
            renderUserDetails();
            await waitForUser();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});