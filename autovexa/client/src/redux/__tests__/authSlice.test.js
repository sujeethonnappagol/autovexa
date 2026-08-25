import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { logout, clearError, setCredentials } from '../authSlice';

/**
 * Strategy: test sync reducers and initial state hydration.
 * Async thunks are better covered with mock API in integration tests;
 * here we focus on pure state transitions.
 */

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has unauthenticated initial state when storage is empty', () => {
    const state = authReducer(undefined, { type: '@@init' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setCredentials stores user session', () => {
    const payload = {
      user: { id: 1, name: 'Test', email: 't@test.com', role: 'user' },
      token: 'jwt-test',
    };
    const state = authReducer(undefined, setCredentials(payload));
    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe('user');
    expect(state.token).toBe('jwt-test');
  });

  it('logout clears session fields', () => {
    let state = authReducer(
      undefined,
      setCredentials({
        user: { id: 1, name: 'A', email: 'a@a.com', role: 'admin' },
        token: 'tok',
      })
    );
    state = authReducer(state, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.role).toBeNull();
  });

  it('clearError resets error and successMessage', () => {
    const dirty = {
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      error: 'Invalid credentials',
      successMessage: 'ok',
    };
    const state = authReducer(dirty, clearError());
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
  });
});
