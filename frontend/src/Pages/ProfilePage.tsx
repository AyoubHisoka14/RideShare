import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Button,
    Text,
    Image,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Spacer, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, ModalFooter, useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { User } from './HomePage';
import logo from "../images/logowhite.png";


interface ProfilePageProps {}

export const ProfilePage: React.FC<ProfilePageProps> = () => {
    const { user, logout,deleteAccount } = useAuth();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();


    const getUser = useCallback(async () => {
        try {
            const res = await fetch(`/api/users/${user?.id}`);
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error(error);
        }
    }, [user?.id]);

    useEffect(() => {
        getUser();
    }, [getUser]);

    const [currentUser, setUser] = useState<User | null>(null); // Initialize as null

    return (
        <Box p={4} bg="gray.100" minH="100vh">
            {/* Navigation and User Profile */}
            <HStack spacing={4} mb={4} bg="blue.500" p={4} borderRadius="md" justify="space-between">
                <HStack spacing={4}>
                    <Image src={logo} alt="Logo" width="10%"/>

                    <Button
                        colorScheme="whiteAlpha"
                        variant="outline"
                        onClick={() => navigate('/')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        Home
                    </Button>
                    <Button
                        colorScheme="whiteAlpha"
                        variant="outline"
                        onClick={() => navigate('/vehicles')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        My Vehicles
                    </Button>
                    <Button
                        colorScheme="whiteAlpha"
                        variant='outline'
                        onClick={() => navigate('/bookings')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        My Bookings
                        </Button>

                    <Button
                        colorScheme="whiteAlpha"
                        variant='outline'
                        onClick={() => navigate('/dashboard')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        My Dashboard
                    </Button>
                </HStack>
                <Menu>
                    <MenuButton>
                        <Avatar size="md" name={user?.username} src={currentUser ? `http://localhost:3400${currentUser.image}` : ''} />
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => navigate('/profile')}>See Profile</MenuItem>
                        <MenuItem onClick={logout}>Log Out</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
            {/* Centering the User Profile */}
            <Flex justify="center">
                <VStack spacing={4} align="center" bg="blue.100" p={4} borderRadius="md" boxShadow="md" w="70%">
                    <Text fontSize="4xl">Profil</Text>
                    <VStack spacing={4}>
                        <Image src={`http://localhost:3400${currentUser?.image}`} boxSize="150px" objectFit="cover" borderRadius="full" />
                        <VStack spacing={4} align="start">
                            <HStack spacing={1} align="center">
                                <Text fontWeight="bold" mr={2}>Username:</Text>
                                <Text>{currentUser?.username}</Text>
                            </HStack>
                            <HStack spacing={10} align="center">
                                <Text fontWeight="bold" mr={2}>Email:</Text>
                                <Text>{currentUser?.email}</Text>
                            </HStack>
                            <HStack spacing={8} align="center">
                                <Text fontWeight="bold" mr={2}>Paypal:</Text>
                                <Text>
                                    {currentUser?.paypalEmail ? currentUser?.paypalEmail : 'Not set'}
                                </Text>
                            </HStack>
                            <HStack spacing={9} align="center">
                                <Text fontWeight="bold" mr={2}>Bookings:</Text>
                                <Text>{currentUser?.bookings?.length}</Text>
                            </HStack>
                            <HStack spacing={12} align="center">
                                <Text fontWeight="bold" mr={2}>Vehicles:</Text>
                                <Text>{currentUser?.vehicles?.length}</Text>
                            </HStack>
                            <Spacer />
                            <HStack  align="center">
                            <Button colorScheme="blue" lang="100%" onClick={() => navigate('/edit-profile')}>Edit Profil</Button>
                            <Spacer />
                                <Button colorScheme="red" onClick={onOpen}>Delete Account</Button>
                            </HStack>
                        </VStack>
                    </VStack>
                </VStack>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Account</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete your account? This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={deleteAccount}>Yes, Delete</Button>
                        <Button variant="ghost" ml={3} onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};
