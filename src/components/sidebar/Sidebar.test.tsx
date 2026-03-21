import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Sidebar from './sidebar';
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

// ─── Helper ───────────────────────────────────────────────────────────────────
const renderSidebar = (props = {}) =>
    render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Sidebar {...props} />
        </MemoryRouter>
    );

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Sidebar Component', () => {
    beforeEach(() => mockNavigate.mockClear());

    // ── Rendering ──────────────────────────────────────────────────────────────
    describe('Rendering', () => {
        it('✅ renders the main navigation landmark', () => {
            renderSidebar();
            expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
        });

        it(' does NOT render a HIDE button or overlay on initial render', () => {
            renderSidebar();
            expect(screen.queryByText(/close menu/i)).not.toBeInTheDocument();
        });
    });

    // ── Semantic HTML & Accessibility ──────────────────────────────────────────
    describe('Semantic HTML & Accessibility', () => {
        it(' hamburger button has correct aria-label and aria-expanded on mount', () => {
            renderSidebar();
            const hamburger = screen.getByRole('button', { name: /open menu/i });
            expect(hamburger).toHaveAttribute('aria-expanded', 'false');
            expect(hamburger).toHaveAttribute('aria-controls', 'main-sidebar');
        });

        it('hamburger does NOT have aria-expanded="true" on initial render', () => {
            renderSidebar();
            expect(
                screen.getByRole('button', { name: /open menu/i })
            ).not.toHaveAttribute('aria-expanded', 'true');
        });
    });

    // ── Mobile Toggle ──────────────────────────────────────────────────────────
    describe('Mobile Toggle', () => {
        it('opens sidebar and shows overlay when hamburger is clicked', async () => {
            renderSidebar();
            await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
            expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
            expect(document.body.style.overflow).toBe('hidden');
        });

        it('does NOT show the overlay before hamburger is clicked', () => {
            renderSidebar();
            expect(document.body.style.overflow).not.toBe('hidden');
        });
    });

    // ── Escape Key ─────────────────────────────────────────────────────────────
    describe('Escape Key', () => {
        it('closes the sidebar when Escape key is pressed', async () => {
            renderSidebar();
            await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
            expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
            await userEvent.keyboard('{Escape}');
            await waitFor(() =>
                expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
            );
        });

        it('does NOT close sidebar on non-Escape key press', async () => {
            renderSidebar();
            await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
            await userEvent.keyboard('{Tab}');
            expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
        });
    });

    // ── Navigation ─────────────────────────────────────────────────────────────
    describe('Navigation', () => {
        it('navigates to the correct path when a menu item is clicked', async () => {
            renderSidebar();
            await userEvent.click(screen.getByRole('button', { name: 'Users' }));
            expect(mockNavigate).toHaveBeenCalledWith('/user');
        });

        it(' does NOT navigate on initial render without interaction', () => {
            renderSidebar();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    // ── Logout ─────────────────────────────────────────────────────────────────
    describe('Logout', () => {
        it(' calls the onLogout prop when provided and logout is clicked', async () => {
            const onLogout = vi.fn();
            renderSidebar({ onLogout });
            await userEvent.click(screen.getByRole('button', { name: /logout/i }));
            expect(onLogout).toHaveBeenCalledOnce();
        });

        it('does NOT call onLogout prop without clicking the logout button', () => {
            const onLogout = vi.fn();
            renderSidebar({ onLogout });
            expect(onLogout).not.toHaveBeenCalled();
        });
    });
});