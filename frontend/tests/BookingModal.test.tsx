import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/provider/AuthProvider';
import { BookingModal } from '../src/Pages/BookingModal'; // Replace '../path/to/BookingModal' with the correct path to the BookingModal module.
import '@testing-library/jest-dom';
import React from 'react';

describe('BookingModal', () => {
    const mockOnClose = vi.fn();
    const vehicleId = "vehicle123";
    const pricePerHour = 20;

    const renderComponent = (isOpen: boolean) => {
        return render(
            <ChakraProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <BookingModal 
                            isOpen={isOpen}
                            onClose={mockOnClose}
                            vehicleId={vehicleId}
                            pricePerHour={pricePerHour}
                        />
                    </AuthProvider>
                </BrowserRouter>
            </ChakraProvider>
        );
    };

    it('should render the modal when open', () => {
        renderComponent(true);
        expect(screen.getByText(/New Booking/i)).toBeInTheDocument();
    });

    it('should close the modal when the close button is clicked', () => {
        renderComponent(true);
        fireEvent.click(screen.getByText(/Close/i));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show validation errors for empty required fields', async () => {
        renderComponent(true);
        fireEvent.click(screen.getByText(/Submit/i));
        expect(await screen.findByText(/Start time is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/End time is required/i)).toBeInTheDocument();
    });

    it('should show error for end time before start time', async () => {
        renderComponent(true);
        fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '2024-08-09T10:00' } });
        fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '2024-08-09T09:00' } });
        fireEvent.click(screen.getByText(/Submit/i));
        expect(await screen.findByText(/End time must be later than start time/i)).toBeInTheDocument();
    });

    it('should show error for booking duration less than 1 hour', async () => {
        renderComponent(true);
        fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '2024-08-09T10:00' } });
        fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '2024-08-09T10:30' } });
        fireEvent.click(screen.getByText(/Submit/i));
        expect(await screen.findByText(/Booking duration must be at least 1 hour/i)).toBeInTheDocument();
    });
});
