import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { VehicleInfoModal } from '../src/Pages/VehicleInfoModal';
import '@testing-library/jest-dom';
import React from 'react';

// Mock data
const mockUser = {
    id: '',
    username: '',
    email: '',
    password: '',
    image: '',
};

const mockVehicle = {
    id: '',
    model: '',
    brand: '',
    available: true,
    type: '',
    picture: '',
    pricePerHour: 0,
    city: '',
    owner: mockUser,
    bookings: [],
};

const renderComponent = (isOpen: boolean) => {
    return render(
        <ChakraProvider>
            <VehicleInfoModal 
                isOpen={isOpen}
                onClose={vi.fn()}
                vehicle={mockVehicle}
            />
        </ChakraProvider>
    );
};

describe('VehicleInfoModal', () => {

    it('should close the modal when the close button is clicked', () => {
        const mockOnClose = vi.fn();
        render(
            <ChakraProvider>
                <VehicleInfoModal 
                    isOpen={true}
                    onClose={mockOnClose}
                    vehicle={mockVehicle}
                />
            </ChakraProvider>
        );

        // Click the close button
        fireEvent.click(screen.getByText(/Close/i));

        // Verify that the onClose handler is called
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not render modal content if isOpen is false', () => {
        const { queryByText } = renderComponent(false);

        // Ensure that modal content is not rendered
        expect(queryByText(/Owner:/i)).not.toBeInTheDocument();
    });
});
