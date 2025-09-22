import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Image,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Spacer,
    useToast,
} from '@chakra-ui/react';
import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import logo from "../images/logowhite.png";
import { User } from "./HomePage.tsx";

interface ProfileEditProps {}

// @ts-ignore
export const ProfileEdit: React.FC<ProfileEditProps> = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [currentUser, setUser] = useState<User | null>(null);

    const getUser = useCallback(async () => {
        try {
            const res = await fetch(`/api/users/${user?.id}`);
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error('Failed to load user details:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        getUser();
    }, [getUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevState: any) => prevState ? { ...prevState, [name]: value } : null);
    };

    const handleSaveData = async () => {
        try {
            const updatedUser = {
                username: currentUser?.username || '',
                email: currentUser?.email || '',
                paypalEmail: currentUser?.paypalEmail || '',
            };

            const res = await fetch(`/api/users/${user?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (res.ok) {
                toast({
                    title: "Profile updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                navigate('/profile')
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast({
                title: "Failed to update profile",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={4} bg="gray.100" minH="100vh">
            <HStack spacing={4} mb={4} bg="blue.500" p={4} borderRadius="md" justify="space-between">
                <HStack spacing={4}>
                    <Image src={logo} alt="Logo" width="10%" />
                    <Button colorScheme="whiteAlpha" variant="outline" onClick={() => navigate('/')} _hover={{ bg: 'white', color: 'black' }}>Home</Button>
                    <Button colorScheme="whiteAlpha" variant="outline" onClick={() => navigate('/vehicles')} _hover={{ bg: 'white', color: 'black' }}>My Vehicles</Button>
                    <Button colorScheme="whiteAlpha" variant='outline' onClick={() => navigate('/bookings')} _hover={{ bg: 'white', color: 'black' }}>My Bookings</Button>
                    <Button colorScheme="whiteAlpha" variant='outline' onClick={() => navigate('/dashboard')} _hover={{ bg: 'white', color: 'black' }}>My Dashboard</Button>
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

            <Flex justify="center">
                <VStack spacing={4} align="center" bg="blue.100" p={4} borderRadius="md" boxShadow="md" w="70%">
                    <Text fontSize="4xl">Profile</Text>
                    <VStack spacing={4}>
                        {/* Profile picture is displayed, but cannot be edited */}
                        <Image src={`http://localhost:3400${currentUser?.image}`} boxSize="150px" objectFit="cover" borderRadius="full" />
                        <VStack spacing={4} align="start">
                            <HStack spacing={1} align="center">
                                <Text fontWeight="bold" mr={2}>Username:</Text>
                                <Input name="username" value={currentUser?.username} onChange={handleInputChange} />
                            </HStack>
                            <HStack spacing={10} align="center">
                                <Text fontWeight="bold" mr={2}>Email:</Text>
                                <Input name="email" value={currentUser?.email} onChange={handleInputChange} />
                            </HStack>
                            <HStack spacing={8} align="center">
                                <Text fontWeight="bold" mr={2}>Paypal:</Text>
                                <Input name="paypalEmail" value={currentUser?.paypalEmail || ''} onChange={handleInputChange} />
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
                            <HStack align="center">
                                <Button colorScheme="red" onClick={() => navigate('/profile')}>Cancel</Button>
                                <Spacer />
                                <Button colorScheme="blue" onClick={handleSaveData}>Save Data</Button>
                            </HStack>
                        </VStack>
                    </VStack>
                </VStack>
            </Flex>

        </Box>
    );
};
