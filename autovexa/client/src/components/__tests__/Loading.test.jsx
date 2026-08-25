import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading', () => {
  it('shows default message', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows custom message', () => {
    render(<Loading message="Loading vehicles..." />);
    expect(screen.getByText('Loading vehicles...')).toBeInTheDocument();
  });
});
