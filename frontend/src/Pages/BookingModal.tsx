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
    useToast,
    VStack
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { InputControl, SubmitButton } from "formik-chakra-ui";
import { object, date as yupDate, ref } from "yup";
import {useAuth} from "../provider/AuthProvider.tsx";

export type BookingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: string | null;
    pricePerHour: number;
};

export type BookingModalFormValues = {
    startTime: string;
    endTime: string;
};

const initialValues: BookingModalFormValues = {
    startTime: "",
    endTime: ""
};

// Validation schema using Yup
export const validationSchema = object({
    startTime: yupDate()
        .required("Start time is required")
        .test("is-future", "Start time must be in the future", value => {
            return value ? new Date(value).getTime() > Date.now() : false;
        }),
    endTime: yupDate()
        .required("End time is required")
        .min(ref("startTime"), "End time must be later than start time")
        .test("min-duration", "Booking duration must be at least 1 hour", function (value) {
            const { startTime } = this.parent;
            return (value && startTime) ? (new Date(value).getTime() - new Date(startTime).getTime()) >= 3600000 : false;
        }),
});

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, vehicleId, pricePerHour }) => {
    const toast = useToast();
    const { user, accessToken} = useAuth();


    const handleSubmit = async (values: BookingModalFormValues) => {
        const startTime = new Date(values.startTime);
        const endTime = new Date(values.endTime);

        if (endTime < startTime) {
            toast({
                title: "Invalid Time Range",
                description: "End time must be later than start time.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if ((endTime.getTime() - startTime.getTime()) < 3600000) {
            toast({
                title: "Invalid Duration",
                description: "Booking duration must be at least 1 hour.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const totalPrice = ((endTime.getTime() - startTime.getTime()) / 3600000) * pricePerHour;

        const formData = {
            startTime: startTime, // Ensure the time is formatted correctly
            endTime: endTime, // Ensure the time is formatted correctly
            totalPrice
        };

        const url = `/api/bookings/${user?.id}/${vehicleId}`;
        const method = "POST";

        try {
            const httpRes = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!httpRes.ok) {
                const res = await httpRes.json();
                console.log(res.error);
            } else {
                toast({
                    title: "Booking created.",
                    description: "The booking has been created successfully.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
                onClose();
            }
        } catch (error) {
            console.error("Failed to create booking:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <Formik<BookingModalFormValues>
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                <Form>
                    <ModalContent>
                        <ModalHeader>New Booking</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <InputControl name="startTime" label="Start Time" inputProps={{ type: 'datetime-local' }} />
                                <InputControl name="endTime" label="End Time" inputProps={{ type: 'datetime-local' }} />
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} onClick={onClose}>
                                Close
                            </Button>
                            <SubmitButton>Submit</SubmitButton>
                        </ModalFooter>
                    </ModalContent>
                </Form>
            </Formik>
        </Modal>
    );
};
