import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { renderWithProviders } from '../../test/testUtils';

/**
 * Strategy: component behavior under different auth states.
 * Assert redirects vs rendered children.
 */

function AppShell() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/" element={<div>Home</div>} />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <div>User Dashboard</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderWithProviders(<AppShell />, {
      route: '/user/dashboard',
      preloadedState: {
        auth: {
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for allowed role', () => {
    renderWithProviders(<AppShell />, {
      route: '/user/dashboard',
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Sujeet', role: 'user' },
          token: 'tok',
          role: 'user',
          isAuthenticated: true,
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('blocks wrong role from admin area', () => {
    renderWithProviders(<AppShell />, {
      route: '/admin/dashboard',
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Sujeet', role: 'user' },
          token: 'tok',
          role: 'user',
          isAuthenticated: true,
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });
    // ProtectedRoute sends unauthorized roles home
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
