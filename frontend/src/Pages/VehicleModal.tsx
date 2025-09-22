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
    useToast
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { InputControl, SelectControl, SubmitButton } from "formik-chakra-ui";
import { object, string, number } from "yup";
import { useAuth } from "../provider/AuthProvider.tsx";

export type VehicleModalProps = {
    isOpen: boolean;
    onClose: () => void;
    vehicle: VehicleModalFormValues;
};

export type VehicleModalFormValues = {
    brand: string;
    model: string;
    type: string;
    pricePerHour: number;
    city: string;
    image: File | null;
};

const initialValues: VehicleModalFormValues = {
    brand: "",
    model: "",
    type: "car",  // Set default value for type
    pricePerHour: 0,
    city: "Darmstadt",  // Set default value for city
    image: null
};

// Validation schema using Yup
export const validationSchema = object({
    brand: string().required("Brand is required"),
    model: string().required("Model is required"),
    type: string().oneOf(['car', 'bike', 'escooter'], "Invalid type").required("Type is required"),
    pricePerHour: number().required("Price per hour is required").positive("Price must be positive"),
    city: string().oneOf(['Darmstadt', 'Frankfurt'], "Invalid city").required("City is required"),
});

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const toast = useToast();
    const { user , accessToken} = useAuth();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <Formik<VehicleModalFormValues>
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    const formData = new FormData();
                    formData.append("brand", values.brand);
                    formData.append("model", values.model);
                    formData.append("type", values.type);
                    formData.append("pricePerHour", String(values.pricePerHour));
                    formData.append("city", values.city);
                    if (file) {
                        formData.append("image", file);
                    }

                    const url = `/api/vehicles/${user?.id}`;
                    const method = "POST";

                    try {
                        const httpRes = await fetch(url, {
                            method: method,
                            headers:{'Authorization': `${accessToken}`},
                            body: formData
                        });

                        if (!httpRes.ok) {
                            const res = await httpRes.json();
                            console.log(res.error);
                        } else {
                            toast({
                                title: "Vehicle added.",
                                description: "The vehicle has been added successfully.",
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                            });
                            onClose();
                            setFile(null);
                        }
                    } catch (error) {
                        console.error("Failed to add vehicle:", error);
                    }
                }}
            >
                <Form>
                    <ModalContent>
                        <ModalHeader>New Vehicle</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <InputControl name="brand" label="Brand" />
                            <InputControl name="model" label="Model" />
                            <SelectControl name="type" label="Type">
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                                <option value="escooter">E-Scooter</option>
                            </SelectControl>
                            <InputControl name="pricePerHour" label="Price Per Hour" />
                            <SelectControl name="city" label="City">
                                <option value="Darmstadt">Darmstadt</option>
                                <option value="Frankfurt">Frankfurt</option>
                            </SelectControl>
                            <FormLabel htmlFor="image">Image</FormLabel>
                            <input id ="image" type="file" name="image" onChange={handleFileChange} />
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
