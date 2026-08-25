import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VehicleCard from '../VehicleCard';
import { renderWithProviders } from '../../test/testUtils';

/**
 * Strategy: presentational component tests.
 * Assert visible content, availability badge, and book CTA behavior.
 */

const vehicle = {
  id: 10,
  brand: 'Toyota',
  model: 'Fortuner',
  year: 2025,
  price: 4200000,
  fuelType: 'Diesel',
  transmission: 'Automatic',
  mileage: '14 km/l',
  status: 'Available',
  vendor: { name: 'ABC Motors' },
  images: ['https://example.com/car.jpg'],
};

describe('VehicleCard', () => {
  it('renders brand, model, and formatted price', () => {
    renderWithProviders(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Fortuner')).toBeInTheDocument();
    expect(screen.getByText(/42,00,000|4,200,000|₹/)).toBeInTheDocument();
  });

  it('shows Available badge when status is Available', () => {
    renderWithProviders(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText(/Available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('hides Book Now when vehicle is not available', () => {
    renderWithProviders(
      <VehicleCard vehicle={{ ...vehicle, status: 'Booked' }} />
    );
    expect(screen.queryByRole('button', { name: /book now/i })).not.toBeInTheDocument();
  });

  it('links to vehicle details', () => {
    renderWithProviders(<VehicleCard vehicle={vehicle} />);
    const details = screen.getByRole('link', { name: /details/i });
    expect(details).toHaveAttribute('href', '/vehicles/10');
  });
});
