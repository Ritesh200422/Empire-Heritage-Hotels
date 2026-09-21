import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomCards } from '@/components/RoomCards';
import type { AvailabilityResult } from '@/lib/types';

describe('RoomCards', () => {
  it('renders room cards when options are available', () => {
    const availability: AvailabilityResult = {
      checkIn: '2027-06-15',
      checkOut: '2027-06-18',
      adults: 2,
      options: [
        { roomTypeId: 'room-1', name: 'Standard Room', unitsLeft: 5, pricePerNight: 129, totalPrice: 387, nights: 3 },
        { roomTypeId: 'room-2', name: 'Deluxe Room', unitsLeft: 2, pricePerNight: 219, totalPrice: 657, nights: 3 },
      ],
    };

    render(<RoomCards availability={availability} />);
    expect(screen.getByText('Standard Room')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('₹129')).toBeInTheDocument();
    expect(screen.getByText('₹387')).toBeInTheDocument();
    expect(screen.getByText('Best Match')).toBeInTheDocument();
  });

  it('renders no rooms available state', () => {
    const availability: AvailabilityResult = {
      checkIn: '2027-06-15',
      checkOut: '2027-06-18',
      adults: 2,
      options: [],
    };

    render(<RoomCards availability={availability} />);
    expect(screen.getByText('No Rooms Available')).toBeInTheDocument();
  });

  it('shows low availability warning for rooms with 3 or fewer units', () => {
    const availability: AvailabilityResult = {
      checkIn: '2027-06-15',
      checkOut: '2027-06-18',
      adults: 2,
      options: [
        { roomTypeId: 'room-1', name: 'Standard Room', unitsLeft: 2, pricePerNight: 129, totalPrice: 387, nights: 3 },
      ],
    };

    render(<RoomCards availability={availability} />);
    expect(screen.getByText('2 left')).toBeInTheDocument();
  });
});
