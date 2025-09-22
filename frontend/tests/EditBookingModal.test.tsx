import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/provider/AuthProvider';
import { EditBookingModal } from '../src/Pages/EditBookingModal';
import '@testing-library/jest-dom';
import { Booking, User, Vehicle } from '../src/Pages/HomePage';
import React from 'react';

// Mock setup
const mockUser: User = {
    image: 'user123',
    username: 'Jane Doe',
    email: 'jane.doe@example.com',
    id: 'user123',
    password: '121212122',
};

const vehicle: Vehicle = {
    id: 'vehicle123',
    brand: 'BMW',
    model: 'X5',
    type: 'car',
    pricePerHour: 20,
    available: true,
    picture: 'vehicle123',
    city: 'Darmstadt',
    owner: mockUser,
    bookings: []
};

const booking: Booking = {
    id: 'booking123',
    startTime: new Date('2024-08-09T10:00').toISOString(),
    endTime: new Date('2024-08-09T12:00').toISOString(),
    totalPrice: 40,
    name: 'Sample Booking',
    isPaid: false,
    renter: mockUser,
    vehicle: vehicle,
    status: 'confirmed'
};

const mockOnClose = vi.fn();

const renderComponent = (isOpen: boolean) => {
    return render(
        <ChakraProvider>
            <BrowserRouter>
                <AuthProvider>
                    <EditBookingModal 
                        isOpen={isOpen}
                        onClose={mockOnClose}
                        booking={booking}
                    />
                </AuthProvider>
            </BrowserRouter>
        </ChakraProvider>
    );
};

beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}) // Mock response body
    });
});

describe('EditBookingModal', () => {
    it('should initialize with correct values and submit form with correct data', async () => {
        renderComponent(true);

        // Verify initial values in the form
        expect(screen.getByLabelText(/Start Time/i)).toHaveValue('2024-08-09T10:00');
        expect(screen.getByLabelText(/End Time/i)).toHaveValue('2024-08-09T12:00');

        // Update form values
        fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '2024-08-09T11:00' } });
        fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '2024-08-09T13:00' } });

        // Submit the form
        fireEvent.click(screen.getByText(/Submit/i));

        });
    

    it('should show error messages for invalid input', async () => {
        renderComponent(true);
    
        // Update form values to create an invalid state
        fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '2024-08-09T12:00' } });
        fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '2024-08-09T11:00' } });
    
        // Submit the form
        fireEvent.click(screen.getByText(/Submit/i));
    
       
    
            // Verify fetch was not called
            expect(global.fetch).not.toHaveBeenCalled();
        });
    
    
});
