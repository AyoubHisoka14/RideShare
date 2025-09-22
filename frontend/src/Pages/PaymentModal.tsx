import React, { useState } from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
    Flex,
    Spinner,
    Center,
    useToast,
} from "@chakra-ui/react";
import { Booking } from "./HomePage.tsx";
import {useAuth} from "../provider/AuthProvider.tsx";

type PaymentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
};

const LoadingModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    return (
        <Modal isOpen={isOpen} onClose={() => {}} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <Center flexDirection="column" p={4}>
                        <Spinner size="xl" />
                        <Text mt={4} fontSize="lg" >
                            Redirecting to PayPal...
                        </Text>
                    </Center>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, booking }) => {
    const toast = useToast();
    const [loadingModalOpen, setLoadingModalOpen] = useState(false);
    const { accessToken} = useAuth();

    if(!booking)
    {
        return;
    }
    const handlePayNow = async () => {
        setLoadingModalOpen(true);
        onClose();

        try {
            const response = await fetch(`/api/paypal/pay/${booking.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url;

            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment initiation failed');
            }
        } catch (error) {
            console.error('Error during payment initiation:', error);
            toast({
                title: "Payment Error",
                description: "There was an error processing your payment.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoadingModalOpen(false);
        }
    };


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Pay Booking</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            {/* Display the total price */}
                            <Text fontSize="lg">
                                Your Booking's Total Price: {booking.totalPrice} €
                            </Text>

                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Flex justify="flex-end" w="100%">
                            <Button
                                colorScheme="blue"
                                onClick={handlePayNow}
                            >
                                Pay Now with PayPal
                            </Button>
                            <Button colorScheme="red" ml={3} onClick={onClose}>
                                Close
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Loading Modal */}
            <LoadingModal isOpen={loadingModalOpen} />
        </>
    );
};
