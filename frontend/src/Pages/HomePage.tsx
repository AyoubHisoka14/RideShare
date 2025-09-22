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
    Heading,
    Grid,
    GridItem,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Spinner, useDisclosure, // Import Spinner to show loading state
    IconButton} from '@chakra-ui/react';
import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {BookingModal} from "./BookingModal.tsx";
import { InfoIcon } from '@chakra-ui/icons';
import { VehicleInfoModal } from './VehicleInfoModal.tsx';
import logo from "../images/logowhite.png";


export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    image: string,
    paypalEmail?: string,
    vehicles?: Vehicle[];
    bookings?: Booking[];
}

export interface Booking {
    id: string;
    name: string;
    isPaid: boolean;
    startTime: string;
    endTime: string;
    totalPrice: number,
    renter: User;
    vehicle: Vehicle;
    status: string;
}

export interface Vehicle {
    id: string;
    model: string;
    brand: string;
    available: boolean;
    type: string;
    picture: string,
    pricePerHour: number,
    city: string,
    owner: User;
    bookings: Booking[];
}

export const HomePage = () => {
    const { user, logout , accessToken} = useAuth();
    const navigate = useNavigate();

    const [vehicleType, setVehicleType] = useState('all');
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]); // State for vehicles
    const [loading, setLoading] = useState(true); // State to track loading status
    const [currentUser, setUser] = useState<User | null>(null); // Initialize as null
    const disclosure = useDisclosure();
    const disclosure2 = useDisclosure();
    const [currentBooking, setBooking] = useState<string >(''); // Initialize as null
    const [currentPrice, setPrice] = useState<number >(0); // Initialize as null
    const [currentVehicle, setVehicle] = useState<Vehicle>(); // State for vehicles




    const getUser = useCallback(async () => {
        try {
            const res = await fetch(`/api/users/${user?.id}`);
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Failed to load travel details:", error);
        }
    }, [user?.id]);

    useEffect(() => {
        getUser();
    }, [getUser]);

    useEffect(() => {
        fetchVehicles(); // Fetch vehicles when component mounts
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await fetch(`/api/vehicles`, {
                method: 'GET',
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if(res.status == 401)
            {
                logout();
            }
            const data = await res.json();
            setVehicles(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        const name = `${vehicle.brand} ${vehicle.model}`;
        const matchesType = vehicleType === 'all' || vehicle.type === vehicleType;
        const matchesCity = selectedCities.length === 0 || selectedCities.includes(vehicle.city);
        const matchesPrice = !maxPrice || vehicle.pricePerHour <= parseFloat(maxPrice);
        const matchesSearchTerm = name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesCity && matchesPrice && matchesSearchTerm;
    });

    return (
        <Box p={4} bg="gray.100" minH="100vh">
            <HStack spacing={4} mb={4} bg="blue.500" p={4} borderRadius="md" justify="space-between">
                <HStack spacing={4}>
                    <Image src={logo} alt="Logo" width="10%"/>
                    <Button
                        colorScheme="whiteAlpha"
                        variant='solid'
                        onClick={() => navigate('/')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        Home
                    </Button>
                    <Button
                        colorScheme="whiteAlpha"
                        variant='outline'
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
                    {loading ? (
                        <Flex justify="center" align="center" h="50vh">
                            <Spinner size="xl" />
                        </Flex>
                    ) : (
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="100%">
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map(vehicle => (
                                    vehicle.available && (
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
                                                    <Flex justify="right" w="100%">
                                                        <IconButton
                                                            aria-label="Info"
                                                            icon={<InfoIcon />}
                                                            onClick={() => {
                                                                setVehicle(vehicle);
                                                                disclosure2.onOpen();
                                                            }}
                                                        />
                                                    </Flex>
                                                    <Image src={`http://localhost:3400${vehicle.picture}`} alt={vehicle.model} boxSize="200px" objectFit="cover" />
                                                    <VStack align="center" mt={4} w="100%">
                                                        <Text fontSize="xl" fontWeight="bold">{vehicle.brand} {vehicle.model}</Text>
                                                        <Text>Price per Hour: {vehicle.pricePerHour}<span>&#8364;</span> </Text>
                                                        <Text>City: {vehicle.city}</Text>
                                                        <Text>Type: {vehicle.type}</Text>
                                                    </VStack>
                                                </VStack>
                                                <Flex justify="center" mt={4}>
                                                    {vehicle.owner.id === user?.id && (
                                                        <Button colorScheme="blue" width="90%" onClick={() => {
                                                            setBooking(vehicle.id);
                                                            setPrice(vehicle.pricePerHour);
                                                            disclosure.onOpen();
                                                        }} isDisabled>Book</Button>
                                                    )}
                                                    {vehicle.owner.id !== user?.id && (
                                                        <Button colorScheme="blue" width="90%" onClick={() => {
                                                            setBooking(vehicle.id);
                                                            setPrice(vehicle.pricePerHour);
                                                            disclosure.onOpen();
                                                        }} >Book</Button>
                                                    )}

                                                </Flex>

                                                <BookingModal
                                                    isOpen={disclosure.isOpen}
                                                    onClose={() => {
                                                        fetchVehicles();
                                                        disclosure.onClose();
                                                    }}
                                                    vehicleId={currentBooking}
                                                    pricePerHour={currentPrice}
                                                />
                                                <VehicleInfoModal
                                                    isOpen={disclosure2.isOpen}
                                                    onClose={disclosure2.onClose}
                                                    vehicle={currentVehicle}
                                                />


                                            </Box>
                                        </GridItem>
                                        )
                                ))
                            ) : (
                                <GridItem colSpan={3}>
                                    <Heading size="md">No vehicles found</Heading>
                                </GridItem>
                            )}
                        </Grid>
                    )}
                </VStack>
            </HStack>

        </Box>
    );
};


