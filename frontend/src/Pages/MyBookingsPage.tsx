import React, {useState, useEffect, useCallback} from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Stack,
    Text,
    Image,
    Flex,
    Select,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar, Grid, GridItem,
    ModalProps,
    useDisclosure, useToast,
} from '@chakra-ui/react';
import {useAuth} from '../provider/AuthProvider';
import {useNavigate} from 'react-router-dom';
import {Booking, User} from './HomePage';
import car from '../images/car.png';
import bike from '../images/bike.png';
import escooter from '../images/escooter.png';
import logo from "../images/logowhite.png";
import {CancelBookingModal} from "./CancelBookingModal.tsx";
import {EditBookingModal} from "./EditBookingModal.tsx";
import {PaymentModal} from "./PaymentModal.tsx";


interface MyBookingsPageProps {
}

export type BookingModalProps = Omit<ModalProps, "children">;


export const MyBookingsPage: React.FC<MyBookingsPageProps> = () => {
    const {user, logout, accessToken} = useAuth();
    const navigate = useNavigate();
    const disclosurebooking = useDisclosure();
    const disclosureEditbooking = useDisclosure();
    const disclosurePayment = useDisclosure();
    const toast = useToast();


    const [paid, setPaid] = useState<boolean | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [currentUser, setUser] = useState<User | null>(null);
    const [currentBooking, setBooking] = useState<String>('');
    // @ts-ignore
    const [currentBookingObject, setBookingObject] = useState<Booking>(null);



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

    // Fetch bookings on component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // Function to fetch bookings
    const fetchBookings = async () => {
        try {
            const res = await fetch(`/api/users/${user?.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            setBookings(data.bookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    // Filtered bookings based on filters and search term
    const filteredBookings = bookings.filter((booking) => {
        const matchesPaid = paid === null || booking.isPaid === paid;
        const matchesStatus = status === null || booking.status === status;
        // const matchesSearchTerm =
        //     booking.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //     booking.renter.username.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPaid && matchesStatus;
    });

    // Handle action when starting a booking
    const handleStartBooking = async (bookingId: string) => {
        try {
            const httpRes = await fetch(`/api/bookings/${bookingId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: "running",
                }),
            });

            if (!httpRes.ok) {
                const res = await httpRes.json();
                console.log(res.error);
            } else {
                toast({
                    title: "Success",
                    description: "Booking was successfully started",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            }
            await fetchBookings();
        } catch (error) {
            console.error(`Failed to toggle status for vehicle with ID ${bookingId}:`, error);

        }
    };

    // Handle action when ending a booking
    const handleEndBooking = async (booking: Booking) => {
        try {
            const now = new Date().getTime();
            let newEndTime: string = booking.endTime;

            if (now > new Date(booking.endTime).getTime()) {
                newEndTime = new Date(now);
            }

            const httpRes = await fetch(`/api/bookings/${booking.id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: "done",
                    endTime: newEndTime,
                }),
            });

            if (!httpRes.ok) {
                const res = await httpRes.json();
                console.log(res.error);
            } else {
                toast({
                    title: "Success",
                    description: "Booking was successfully ended",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            }
            await fetchBookings();
        } catch (error) {
            console.error(`Failed to toggle status for vehicle:`, error);

        }
    };


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
    const handlePayBooking = (booking: Booking) => {
        setBookingObject(booking);
        disclosurePayment.onOpen();  // Open the payment modal
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
                        _hover={{bg: 'white', color: 'black'}}
                    >
                        Home
                    </Button>
                    <Button
                        colorScheme="whiteAlpha"
                        variant="outline"
                        onClick={() => navigate('/vehicles')}
                        _hover={{bg: 'white', color: 'black'}}
                    >
                        My Vehicles
                    </Button>
                    <Button colorScheme="whiteAlpha" variant="solid" _hover={{bg: 'white', color: 'black'}}>
                        My Bookings
                    </Button>
                    <Button
                        colorScheme="whiteAlpha"
                        variant='outline'
                        onClick={() => navigate('/dashboard')}
                        _hover={{bg: 'white', color: 'black'}}
                    >
                        My Dashboard
                    </Button>
                </HStack>
                <Menu>
                    <MenuButton>
                        <Avatar size="md" name={user?.username}
                                src={currentUser ? `http://localhost:3400${currentUser.image}` : ''}/>
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => navigate('/profile')}>See Profile</MenuItem>
                        <MenuItem onClick={logout}>Log Out</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>

            {/* Filters and Search */}
            <HStack align="flex-start">
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
                    <Select value={status ?? ''}
                            onChange={(e) => setStatus(e.target.value === '' ? null : e.target.value)}>
                        <option value="">All Status</option>
                        <option value="booked">Booked</option>
                        <option value="running">Running</option>
                        <option value="done">Done</option>
                    </Select>
                    <Input
                        placeholder="Search for bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        width="100%"
                    />
                </VStack>

                {/* Display Bookings */}
                <VStack spacing={4} w="78%">
                    <Grid templateColumns={{ md: "1fr", lg: "repeat(2, 1fr)" }} gap={6} w="100%">
                        {filteredBookings.map((booking) => (
                            <GridItem key={booking.id} w="100%">
                                <Box
                                    key={booking.id}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="white"
                                    shadow="md"
                                    w="100%"
                                    h="100%"
                                    _hover={{transform: 'scale(1.05)', transition: 'transform 0.2s'}}

                                >
                                    <HStack spacing={4} alignItems="center" justifyContent="space-between">
                                        {/* Vehicle Image/Icon (Left Side) */}
                                        {booking.vehicle.type === 'car' && (
                                            <Image src={car} alt={booking.vehicle.model} boxSize="100px"
                                                   objectFit="cover"/>
                                        )}
                                        {booking.vehicle.type === 'bike' && (
                                            <Image src={bike} alt={booking.vehicle.model} boxSize="100px"
                                                   objectFit="cover"/>
                                        )}
                                        {booking.vehicle.type === 'escooter' && (
                                            <Image src={escooter} alt={booking.vehicle.model} boxSize="100px"
                                                   objectFit="cover"/>
                                        )}

                                        {/* Booking Info (Center) */}
                                        <VStack align="center" spacing={1} flex="1">
                                            <Text fontSize="xl" fontWeight="bold">
                                                {booking.vehicle.brand} {booking.vehicle.model}
                                            </Text>
                                            <Text>
                                                Start Date: {formatDate(booking.startTime)}
                                                <br/>
                                                End Date: {formatDate(booking.endTime)}
                                            </Text>
                                            <Text>Total Price: {booking.totalPrice}€</Text>
                                            <Text mt='2'>Status: <Box as="span" bg={getStatusBgColor(booking.status)} p={1} borderRadius="md">{booking.status}</Box> </Text>
                                            <Text mt='2' bg={getPaymentBgColor(booking.isPaid)} p={1} borderRadius="md">{booking.isPaid ? 'Paid' : 'Not Paid'}</Text>
                                        </VStack>

                                        {/* Buttons (Right Side) */}
                                        <Flex direction="column" align="center" justify="center">
                                            <Stack spacing={4}>
                                                {booking.status === 'booked' && new Date() >= new Date(booking.startTime) && (
                                                    <>
                                                        <Button colorScheme="blue" onClick={() => handleStartBooking(booking.id)}>
                                                            Start Booking
                                                        </Button>
                                                        <Button colorScheme="green" onClick={() => {
                                                            setBookingObject(booking);
                                                            disclosureEditbooking.onOpen();
                                                        }}>
                                                            Edit Booking
                                                        </Button>
                                                        <Button colorScheme="red" onClick={() => {
                                                            setBooking(booking.id);
                                                            disclosurebooking.onOpen();
                                                        }}>
                                                            Cancel Booking
                                                        </Button>
                                                        <CancelBookingModal
                                                            isOpen={disclosurebooking.isOpen}
                                                            onClose={() => {
                                                                fetchBookings();
                                                                disclosurebooking.onClose();
                                                            }}
                                                            currentBooking={currentBooking}
                                                        />
                                                    </>
                                                )}

                                                {booking.status === 'booked' && new Date() < new Date(booking.startTime) && (
                                                    <>
                                                        <Button colorScheme="blue" onClick={() => handleStartBooking(booking.id)} isDisabled>
                                                            Start Booking
                                                        </Button>
                                                        <Button colorScheme="green" onClick={() => {
                                                            setBookingObject(booking);
                                                            disclosureEditbooking.onOpen();
                                                        }}>
                                                            Edit Booking
                                                        </Button>
                                                        <Button colorScheme="red" onClick={() => {
                                                            setBooking(booking.id);
                                                            disclosurebooking.onOpen();
                                                        }}>
                                                            Cancel Booking
                                                        </Button>
                                                        <CancelBookingModal
                                                            isOpen={disclosurebooking.isOpen}
                                                            onClose={() => {
                                                                fetchBookings();
                                                                disclosurebooking.onClose();
                                                            }}
                                                            currentBooking={currentBooking}
                                                        />
                                                    </>
                                                )}
                                                <EditBookingModal
                                                    isOpen={disclosureEditbooking.isOpen}
                                                    onClose={() => {
                                                        fetchBookings();
                                                        disclosureEditbooking.onClose();
                                                    }}
                                                    booking={currentBookingObject}
                                                />
                                                {booking.status === 'running' && (
                                                    <Button colorScheme="blue"
                                                            onClick={() => handleEndBooking(booking)}>
                                                        End Booking
                                                    </Button>
                                                )}
                                                {booking.status === 'done' && !booking.isPaid &&(
                                                    <Button colorScheme="blue" onClick={() => handlePayBooking(booking)}>
                                                        Pay Booking
                                                    </Button>
                                                )}
                                                {/* Payment Modal */}
                                                <PaymentModal
                                                    isOpen={disclosurePayment.isOpen}
                                                    onClose={() => {
                                                        fetchBookings();
                                                        disclosurePayment.onClose();
                                                    }}
                                                    booking={currentBookingObject}
                                                />
                                            </Stack>
                                        </Flex>
                                    </HStack>
                                </Box>
                            </GridItem>
                        ))}
                    </Grid>
                </VStack>

            </HStack>
        </Box>
    );


};

