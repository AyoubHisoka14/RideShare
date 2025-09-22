import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/provider/AuthProvider';
import { VehicleModal } from '../src/Pages/VehicleModal';
import '@testing-library/jest-dom';
import React from 'react';

describe('VehicleModal', () => {
    const mockOnClose = vi.fn();
    
    const renderComponent = (isOpen: boolean) => {
        return render(
            <ChakraProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <VehicleModal
                            isOpen={isOpen}
                            vehicle={{
                                brand: "",
                                model: "",
                                type: "car",
                                pricePerHour: 0,
                                city: "Darmstadt",
                                image: null
                            }}
                            onClose={mockOnClose}
                        />
                    </AuthProvider>
                </BrowserRouter>
            </ChakraProvider>
        );
    };

    it('should render the modal when open', () => {
        renderComponent(true);
        expect(screen.getByText(/New Vehicle/i)).toBeInTheDocument();
    });

    it('should close the modal when the close button is clicked', () => {
        renderComponent(true);
        fireEvent.click(screen.getByText(/Close/i));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show validation errors when submitting with empty required fields', async () => {
        renderComponent(true);
        fireEvent.click(screen.getByText(/Submit/i));
        expect(await screen.findByText(/Brand is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Model is required/i)).toBeInTheDocument();
    });
    
    it('should accept file input', () => {
        renderComponent(true);
        const fileInput = screen.getByLabelText(/Image/i) as HTMLInputElement;
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
        expect(fileInput.files?.[0]).toEqual(file);
    });
});
