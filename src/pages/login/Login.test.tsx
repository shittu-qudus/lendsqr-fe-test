import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Login from './login';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login Component', () => {
  beforeEach(() => mockNavigate.mockClear());

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders key elements (heading, inputs, submit button)', () => {
      renderLogin();
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('does NOT show an error or HIDE button on initial render', () => {
      renderLogin();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /hide password/i })).not.toBeInTheDocument();
    });
  });

  // ── Semantic HTML & Accessibility ──────────────────────────────────────────
  describe('Semantic HTML & Accessibility', () => {
    it('uses correct landmarks and associates labels with inputs', () => {
      const { container } = renderLogin();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(container.querySelector('fieldset')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('forgot password link does NOT use a "#" placeholder href', () => {
      renderLogin();
      expect(screen.getByRole('link', { name: /forgot password/i }))
        .not.toHaveAttribute('href', '#');
    });
  });

  // ── Password Visibility Toggle ─────────────────────────────────────────────
  describe('Password Visibility Toggle', () => {
    it('clicking SHOW reveals the password and updates aria-pressed', async () => {
      renderLogin();
      const toggle = screen.getByRole('button', { name: /show password/i });
      await userEvent.click(toggle);
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggling does NOT clear the typed password value', async () => {
      renderLogin();
      await userEvent.type(screen.getByPlaceholderText('Password'), 'MySecret');
      await userEvent.click(screen.getByRole('button', { name: /show password/i }));
      expect(screen.getByPlaceholderText('Password')).toHaveValue('MySecret');
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  describe('Validation', () => {
    it('no error shown when both fields are filled and submitted', async () => {
      renderLogin();
      await userEvent.type(screen.getByPlaceholderText('Email'), 'user@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });

    it('shows error when either field is empty', async () => {
      renderLogin();
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /please enter email and password/i
      );
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('navigates to /dashboard on valid login', async () => {
      renderLogin();
      await userEvent.type(screen.getByPlaceholderText('Email'), 'user@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
    });

    it('does NOT navigate when fields are empty', async () => {
      renderLogin();
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});