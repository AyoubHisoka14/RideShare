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
    FormLabel,
    useToast,
    VStack
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { InputControl, SubmitButton } from "formik-chakra-ui";
import {object, date as yupDate, ref, date} from "yup";
import {useAuth} from "../provider/AuthProvider.tsx";
import {Booking} from "./HomePage.tsx";
import { format, toZonedTime } from 'date-fns-tz';

export type EditBookingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
};

export type BookingModalFormValues = {
    startTime: string;
    endTime: string;
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

export const EditBookingModal: React.FC<EditBookingModalProps> = ({ isOpen, onClose, booking }) => {
    const toast = useToast();
    const { user, accessToken} = useAuth();

    if (!booking) {
        return null;  // or render a placeholder, loading spinner, or an error message
    }

    const formatDateTimeLocal = (dateString: string) => {
        // Convert the UTC date string to a local date object
        const zonedDate = toZonedTime(dateString, Intl.DateTimeFormat().resolvedOptions().timeZone);
        // Format the date to the 'YYYY-MM-DDTHH:MM' format
        return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
    };

    const initialValues: BookingModalFormValues = {
        startTime: booking.startTime ? formatDateTimeLocal(booking.startTime) : '',
        endTime: booking.endTime ? formatDateTimeLocal(booking.endTime) : '',
    };

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

        const durationHours = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 3600000;
        const pricePerHour = booking.totalPrice/durationHours
        console.log(pricePerHour)

        const totalPrice = ((endTime.getTime() - startTime.getTime()) / 3600000) * pricePerHour;

        const formData = {
            startTime: startTime, // Ensure the time is formatted correctly
            endTime: endTime, // Ensure the time is formatted correctly
            totalPrice
        };

        const url = `/api/bookings/${booking.id}`;
        const method = "PUT";

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
                toast({
                    title: "Error",
                    description: res.message,
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Booking Edited.",
                    description: "The booking has been edited successfully.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
                onClose();
            }
        } catch (error) {
            console.error("Failed to edit booking:", error);
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
                        <ModalHeader>Edit Booking</ModalHeader>
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
