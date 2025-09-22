import React, {useState, useEffect, useCallback} from 'react';
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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Grid,
    GridItem,
    useDisclosure,
    Spacer
} from '@chakra-ui/react';
import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import car from '../images/car.png';
import bike from '../images/bike.png';
import escooter from '../images/escooter.png';
import {Booking, User} from "./HomePage.tsx";
import logo from "../images/logowhite.png";
import {CancelBookingModal} from "./CancelBookingModal.tsx";



interface ManageBookingsPageProps {}

export const ManageBookingsPage: React.FC<ManageBookingsPageProps> = () => {
    const { user, logout, accessToken } = useAuth();
    const navigate = useNavigate();
    const disclosurebooking = useDisclosure();


    const [paid, setPaid] = useState<boolean | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [vehicleType, setVehicleType] = useState<string | null>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
    const [currentUser, setUser] = useState<User | null>(null); // Initialize as null
    const [currentBooking, setBooking] = useState<String>(''); // Initialize as null


    const getUser = useCallback(async () => {
        try {
            console.log("Reached");
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

    // Fetch bookings on component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // Function to fetch bookings
    const fetchBookings = async () => {
        try {
            const res = await fetch(`/api/bookings/${user?.id}/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }); // Adjust endpoint as per your backend API
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    // Filtered list of vehicles based on selected vehicle type
    const filteredVehicles = currentUser?.vehicles?.filter((vehicle: { type: string | null; }) => {
        return vehicleType === 'all' || vehicle.type === vehicleType;
    });

    // Filtered bookings based on filters and search term
    const filteredBookings = bookings.filter((booking) => {
        const matchesPaid = paid === null || booking.isPaid === paid;
        const matchesStatus = status === null || booking.status === status;
        const matchesVehicleType = vehicleType === 'all' || booking.vehicle.type === vehicleType;
        const matchesSelectedVehicles = selectedVehicles.length === 0 || selectedVehicles.includes(booking.vehicle.id);
        const matchesSearchTerm =
            booking.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.renter.username.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPaid && matchesStatus && matchesVehicleType && matchesSelectedVehicles && matchesSearchTerm;
    });


    // Function to format date from ISO format
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'booked':
                return 'gray.300';
            case 'running':
                return 'green.200';
            case 'done':
                return 'blue.200';
            default:
                return 'white';
        }
    };

    // Determine background color based on payment status
    const getPaymentBgColor = (isPaid: boolean) => {
        return isPaid ? 'green.200' : 'red.200';
    };


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
                        variant="outline"
                        onClick={() => navigate('/bookings')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        My Bookings
                    </Button>
                    <Button colorScheme="whiteAlpha" variant="solid" _hover={{ bg: 'white', color: 'black' }}>
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

            {/* User Info */}
            <HStack align="start" mb={10} >

                <Spacer />
                <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        Stactics
                    </Button>
                    <Button colorScheme="blue" variant="solid" _hover={{ bg: 'white', color: 'black' }}>
                        Manage Bookings
                    </Button>
            </HStack>

            <Heading size="lg" mb={4}>
                Manage Bookings
            </Heading>

            <HStack align="flex-start">
                {/* Filters */}
                <VStack align="flex-start" spacing={4} w="20%" bg="blue.100" p={4} borderRadius="md">
                    <Text fontSize="lg" fontWeight="bold">
                        Filters
                    </Text>
                    <Select
                        value={paid === null ? '' : paid ? 'paid' : 'unpaid'}
                        onChange={(e) => {
                            if (e.target.value === '') {
                                setPaid(null);
                            } else if (e.target.value === 'paid') {
                                setPaid(true);
                            } else if (e.target.value === 'unpaid') {
                                setPaid(false);
                            }
                        }}
                    >
                        <option value="">All Payment Status</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </Select>

                    <Select value={status ?? ''} onChange={(e) => setStatus(e.target.value === '' ? null : e.target.value)}>
                        <option value="">All Status</option>
                        <option value="booked">Booked</option>
                        <option value="running">Running</option>
                        <option value="done">Done</option>
                    </Select>
                    <Select value={vehicleType ?? 'all'} onChange={(e) => setVehicleType(e.target.value)}>
                        <option value="all">All Vehicle Types</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="escooter">E-scooter</option>
                    </Select>
                    <CheckboxGroup
                        value={selectedVehicles}
                        onChange={(values) => setSelectedVehicles(values as string[])}
                    >
                        <Stack direction="column">
                            {filteredVehicles?.map(vehicle => (
                                <Checkbox key={vehicle.id} value={vehicle.id}>
                                    {vehicle.brand} {vehicle.model}
                                </Checkbox>
                            ))}
                        </Stack>
                    </CheckboxGroup>
                    <Input
                        placeholder="Search for bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        width="100%"
                    />
                </VStack>

                {/* Display Bookings */}
                <VStack spacing={4} w="78%">
                    <Grid templateColumns="repeat(2, 1fr)" gap={6} w="100%">
                        {filteredBookings.map((booking) => (
                            <GridItem key={booking.id} w="100%">
                                <Box
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="white"
                                    shadow="md"
                                    w="100%"
                                    h="100%" // Ensure the box takes the full height of the grid item
                                    display="flex"
                                    flexDirection="row" // Ensure items are in a row
                                    justifyContent="space-between" // Space out the contents horizontally
                                    alignItems="center" // Align items vertically centered
                                    _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}

                                >
                                    {/* Vehicle Image/Icon (Left Side) */}
                                    {booking.vehicle.type === 'car' && (
                                        <Image src={car} alt={booking.vehicle.model} boxSize="100px" objectFit="cover" />
                                    )}
                                    {booking.vehicle.type === 'bike' && (
                                        <Image src={bike} alt={booking.vehicle.model} boxSize="100px" objectFit="cover" />
                                    )}
                                    {booking.vehicle.type === 'escooter' && (
                                        <Image src={escooter} alt={booking.vehicle.model} boxSize="100px" objectFit="cover" />
                                    )}

                                    <VStack align="center" spacing={1} flex="1" ml={4}>
                                        <Text fontSize="lg" fontWeight="bold">{booking.vehicle.brand} {booking.vehicle.model}</Text>
                                        <Text>Price: {booking.totalPrice}€</Text>
                                        <Text>Start Time: {formatDate(booking.startTime)}</Text>
                                        <Text>End Time: {formatDate(booking.endTime)}</Text>
                                        <Text mt='2'>Status: <Box as="span" bg={getStatusBgColor(booking.status)} p={1} borderRadius="md">{booking.status}</Box> </Text>
                                        <Text mt='2' mb='2' bg={getPaymentBgColor(booking.isPaid)} p={1} borderRadius="md">{booking.isPaid ? 'Paid' : 'Not Paid'}</Text>
                                        {booking.status === 'booked' && (
                                            <Button  colorScheme="red" width="50%" onClick={() => {
                                                setBooking(booking.id);
                                                disclosurebooking.onOpen();
                                            }}>Cancel Booking</Button>
                                        )}

                                    </VStack>

                                    <CancelBookingModal
                                        isOpen={disclosurebooking.isOpen}
                                        onClose={() => {
                                            fetchBookings();
                                            disclosurebooking.onClose();
                                        }}
                                        currentBooking={currentBooking}
                                    />

                                    {/* Renter Info (Right Side) */}
                                    <Flex direction="column" align="center" justify="center" ml={4}>
                                        <Avatar size="2xl" src={`http://localhost:3400${booking.renter.image}`} mb={2} />
                                        <Text fontSize="xl" fontWeight="bold">{booking.renter.username}</Text>
                                    </Flex>
                                </Box>
                            </GridItem>

                        ))}
                    </Grid>
                </VStack>
            </HStack>
        </Box>
    );
};
