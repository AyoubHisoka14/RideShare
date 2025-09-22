import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Checkbox,
    CheckboxGroup,
    Stack,
    Text,
    Image,
    Flex,
    Select,
    Grid,
    GridItem,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    useDisclosure,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter // Import Spinner to show loading state
} from '@chakra-ui/react';
import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {User, Vehicle} from "./HomePage.tsx";
import image from '../images/addcar.png';
import {VehicleModal} from "./VehicleModal.tsx"; // Import your images
import logo from "../images/logowhite.png";
import {BookingModalProps} from "./MyBookingsPage.tsx";



export const MyVehiclesPage = () => {
    const { user, logout, accessToken } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();


    const [vehicleType, setVehicleType] = useState('all');
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [currentUser, setUser] = useState<User | null>(null);
    const disclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();
    const [currentVehicle, setVehicle] = useState<String>('');




    const getUser = useCallback(async () => {
        try {
            const res = await fetch(`/api/users/${user?.id}`);
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Failed to load user details:", error);
        }
    }, [user?.id]);

    const fetchVehicles = async () => {
        try {
            const res = await fetch(`/api/users/${user?.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }); // Adjust endpoint as per your backend API
            const data = await res.json();
            setVehicles(data.vehicles);
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
        }
    };

    useEffect(() => {
        getUser();
    }, [getUser]);

    useEffect(() => {
        fetchVehicles();
    }, []);


    const handleDeactivateActivate = async (vehicleId: string, currentStatus: boolean) => {
        try {
            const newState = !currentStatus;
            const httpRes = await fetch(`/api/vehicles/${vehicleId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    available: newState,
                }),
            });

            if (!httpRes.ok) {
                const res = await httpRes.json();
                console.log(res.error);
            } else {
                toast({
                    title: "Success",
                    description: newState? "Vehicle was successfully Activated" : "Vehicle was successfully Deactivated",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            }
            await fetchVehicles();

        } catch (error) {
            console.error(`Failed to toggle status for vehicle with ID ${vehicleId}:`, error);

        }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesType = vehicleType === 'all' || vehicle.type === vehicleType;
        const matchesCity = selectedCities.length === 0 || selectedCities.includes(vehicle.city);
        const matchesPrice = !maxPrice || vehicle.pricePerHour <= parseFloat(maxPrice);
        const matchesSearchTerm = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesCity && matchesPrice && matchesSearchTerm;
    });

    const VehicleModaldelete = ({ isOpen, onClose }: BookingModalProps) => {
        // Handle action when editing a booking
        const deleteBooking = async () => {
            try {
                const httpRes = await fetch(`/api/vehicles/${currentVehicle}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if(!httpRes.ok)
                {
                    const res = await httpRes.json();
                    toast({
                        title: "Failed",
                        description: res.message,
                        status: "error",
                        duration: 2000,
                        isClosable: true,
                    });
                }
                else {
                    toast({
                        title: "Success",
                        description: "Vehicle was successfully deleted",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                    });
                }
                await fetchVehicles();
                onClose();
            } catch (error) {
                console.error(`Failed to delete Vehicle}:`, error);

            }
        };
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Vehicle</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete this Vehicle?
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Back
                        </Button>
                        <Button variant="ghost" onClick={() => deleteBooking()}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    };

    return (
        <Box p={4} bg="gray.100" minH="100vh">
            <HStack spacing={4} mb={4} bg="blue.500" p={4} borderRadius="md" justify="space-between">
                <HStack spacing={4}>
                    <Image src={logo} alt="Logo" width="10%"/>

                    <Button
                        colorScheme="whiteAlpha"
                        variant='outline'
                        onClick={() => navigate('/')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        Home
                    </Button>
                    <Button
                        colorScheme="whiteAlpha"
                        variant='solid'
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

            <HStack justify="center" mb={4}>
                <Input
                    placeholder="Search for vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    width="50%"
                    bg="blue.100"
                />
            </HStack>

            <HStack align="flex-start">
                <VStack align="flex-start" spacing={4} w="20%" bg="blue.100" p={4} borderRadius="md">
                    <Text fontSize="lg" fontWeight="bold">Filters</Text>
                    <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                        <option value="all">All</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="escooter">eScooter</option>
                    </Select>
                    <Text fontSize="md" fontWeight="bold">Cities</Text>
                    <CheckboxGroup value={selectedCities} onChange={(values) => setSelectedCities(values as string[])}>
                        <Stack direction="column">
                            <Checkbox value="Darmstadt">Darmstadt</Checkbox>
                            <Checkbox value="Frankfurt">Frankfurt</Checkbox>
                        </Stack>
                    </CheckboxGroup>
                    <Text fontSize="md" fontWeight="bold">Max Price</Text>
                    <Input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value === '' ? '' : e.target.value)}
                    />
                </VStack>

                <VStack spacing={4} w="80%">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="100%">
                        {filteredVehicles.map(vehicle => (
                            <GridItem key={vehicle.id} w="100%">
                                <Box
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="white"
                                    shadow="md"
                                    _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
                                    w="100%"
                                >
                                    <VStack>
                                        <Image src={`http://localhost:3400${vehicle.picture}`} alt={vehicle.model} boxSize="200px" objectFit="cover" />
                                        <VStack align="center" mt={4} w="100%">
                                            <Text fontSize="xl" fontWeight="bold">{vehicle.brand} {vehicle.model}</Text>
                                            <Text>Type: {vehicle.type}</Text>
                                            <Text>Price per Hour: {vehicle.pricePerHour} €</Text>
                                            <Text>City: {vehicle.city}</Text>
                                            <Text>Status: {vehicle.available ? 'Activated' : 'Deactivated'}</Text>

                                        </VStack>
                                    </VStack>
                                    <Flex justify="center" mt={4}>
                                        <Button colorScheme="blue" mr={2} onClick={() => {
                                            setVehicle(vehicle.id);
                                            deleteDisclosure.onOpen()
                                        }}>
                                            Delete
                                        </Button>
                                        <VehicleModaldelete isOpen={deleteDisclosure.isOpen} onClose={deleteDisclosure.onClose} />
                                        {vehicle.available?  (
                                            <Button colorScheme="red" onClick={() => handleDeactivateActivate(vehicle.id, vehicle.available)}>Deactivate</Button>
                                        ) : (
                                            <Button colorScheme="green" onClick={() => handleDeactivateActivate(vehicle.id, vehicle.available)}>Activate</Button>
                                        )}
                                    </Flex>
                                </Box>
                            </GridItem>
                        ))}
                        {/* Additional card for adding a new vehicle */}
                        <GridItem key="addNew" w="100%">
                            <Box
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                bg="white"
                                shadow="md"
                                _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
                                w="100%"
                                cursor="pointer"
                                onClick={() =>{
                                    console.log("x");
                                    if(currentUser?.paypalEmail) {
                                        console.log(currentUser.paypalEmail);
                                        disclosure.onOpen()
                                    }
                                    else {
                                        toast({
                                            title: "Missing Paypal Email",
                                            description: "Please add a PayPal Email to be able to add a new vehicle",
                                            status: "error",
                                            duration: 2000,
                                            isClosable: true,
                                        });
                                    }

                                }}
                            >
                                <VehicleModal
                                    isOpen={disclosure.isOpen}
                                    onClose={() => {
                                        fetchVehicles();
                                        disclosure.onClose();
                                    }}
                                />
                                <VStack>
                                    <Image src={image} alt="Add Vehicle" boxSize="200px" objectFit="cover" />
                                    <Text fontSize="xl" fontWeight="bold">Add New Vehicle</Text>
                                </VStack>
                            </Box>
                        </GridItem>
                    </Grid>
                </VStack>
            </HStack>
        </Box>
    );
};
