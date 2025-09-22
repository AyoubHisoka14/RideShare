import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, useToast
} from "@chakra-ui/react";
import React from "react";
import {useAuth} from "../provider/AuthProvider.tsx";

export type CancelBookingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    currentBooking: String;
};

export const CancelBookingModal = ({isOpen, onClose, currentBooking}: CancelBookingModalProps) => {
    const toast = useToast();
    const { accessToken} = useAuth();
    // Handle action when editing a booking
    const deleteBooking = async () => {
        try {
            const httpRes = await fetch(`/api/bookings/${currentBooking}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!httpRes.ok) {
                const res = await httpRes.json();
                console.log(res.error);
            } else {
                toast({
                    title: "Success",
                    description: "Booking was successfully canceled",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            }
            onClose();
        } catch (error) {
            console.error(`Failed to toggle status for vehicle `, error);

        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Cancel Booking</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    Are you sure you want to Cancel this booking?
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Back
                    </Button>
                    <Button variant="ghost" colorScheme="red" onClick={() => deleteBooking()}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
