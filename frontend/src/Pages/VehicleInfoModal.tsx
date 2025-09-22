import React, {  } from 'react';
// @ts-ignore
import {
    VStack,
    HStack,
    Button,
    Text,
    Image,
    // Import Spinner to show loading state
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Center
} from '@chakra-ui/react';
// @ts-ignore
import {Vehicle} from "./HomePage.tsx";


export interface VehicleInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
}

// @ts-ignore
export const VehicleInfoModal: React.FC<VehicleInfoModalProps> = ({ isOpen, onClose, vehicle }) => {
    if (!vehicle) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader></ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="flex-start">
                        <Center w="100%">
                            <Image src={`http://localhost:3400${vehicle.owner.image}`} boxSize="200px" objectFit="cover" borderRadius="full"/>
                        </Center>
                        <HStack>
                            <Text fontWeight="bold">Owner:</Text>
                            <Text>{vehicle.owner.username}</Text>
                        </HStack>
                        <HStack>
                            <Text fontWeight="bold">Email:</Text>
                            <Text>{vehicle.owner.email}</Text>
                        </HStack>
                        <HStack>
                            <Text fontWeight="bold">Vehicle:</Text>
                            <Text>{vehicle.brand} {vehicle.model}</Text>
                        </HStack>
                        <HStack>
                            <Text fontWeight="bold">Type:</Text>
                            <Text>{vehicle.type}</Text>
                        </HStack>
                        <HStack>
                            <Text fontWeight="bold">City:</Text>
                            <Text>{vehicle.city}</Text>
                        </HStack>
                        <HStack>
                            <Text fontWeight="bold">Price per Hour:</Text>
                            <Text>{vehicle.pricePerHour}€</Text>
                        </HStack>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
