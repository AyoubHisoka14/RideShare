import React, {useState, useEffect, useCallback} from 'react';
import {
    Box,
    VStack,
    HStack,
    Button,
    Text,
    Image,
    Select,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    GridItem,
    SimpleGrid,
    Spacer,
    Flex
} from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {Booking, User} from "./HomePage.tsx";
import logo from "../images/logowhite.png";


interface DashboardPageProps {}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
    
    const { user, logout,accessToken} = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [totalEarnings, setTotalEarnings] = useState<number>(0);
    const [earningsData, setearningsData] = useState<any>(0);

    const [currentUser, setUser] = useState<User | null>(null); // Initialize as null

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
        const res = await fetch(`/api/bookings/${user?.id}/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `${accessToken}`,
                'Content-Type': 'application/json'
            }
        }); // Adjust endpoint as per your backend API

        const data = await res.json();
        setBookings(data);
        
        // Initialize an array of 12 elements (one for each month)
        const monthlyEarnings = Array(12).fill(0);
        const monthlyBookings = Array(12).fill(0);


        // Calculate total earnings and monthly earnings
        const totalEarnings = data.reduce((acc: number , booking: Booking) => {
            const bookingDate = new Date(booking.endTime); // Assume the booking has a 'date' field
            const month = bookingDate.getMonth(); // Get month from 0 (January) to 11 (December)
            monthlyEarnings[month] += booking.totalPrice; // Add totalPrice to corresponding month
            return acc + booking.totalPrice;
        }, 0);

        const totalBookings = data.reduce((acc: number , booking: Booking) => {
            const bookingDate = new Date(booking.endTime); // Assume the booking has a 'date' field
            const month = bookingDate.getMonth(); // Get month from 0 (January) to 11 (December)
            monthlyBookings[month] += 1; // Add totalPrice to corresponding month
            return acc + 1;
        }, 0);

        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        const earningsData = months.map((month, index) => ({
            name: month,
            Earnings: monthlyEarnings[index],
            bookings: monthlyBookings[index]
        }));

        console.log(earningsData);

        
        // Set the state for total earnings and monthly earnings
        setTotalEarnings(totalEarnings);
        setearningsData(earningsData);

    } catch (error) {
        console.error('Failed to fetch bookings:', error);
    }
};


    return (
        <Flex>
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
            <HStack align="start" mb={8}>
                <Spacer />
                <Button colorScheme="blue" variant="solid" _hover={{ bg: 'white', color: 'black' }}>
                        Statics
                    </Button>

                <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => navigate('/manage-bookings')}
                        _hover={{ bg: 'white', color: 'black' }}
                    >
                        Manage Bookings
                    </Button>
            </HStack>



            <VStack align="center" mb={10}>
            {/* Stats */}
            <Box borderWidth="2px"  borderRadius="lg" p={5} boxShadow="lg" >
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    <GridItem>
                        <Box borderWidth="1px" borderRadius="md" p={4} boxShadow="md" textAlign="center">
                            <Text fontSize="2xl" color="blue.500">{currentUser?.vehicles?.length}</Text>
                            <Text fontSize="xl">Vehicles</Text>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box borderWidth="1px" borderRadius="md" p={4} boxShadow="md" textAlign="center">
                            <Text fontSize="2xl" color="blue.500">{bookings.length}</Text>
                            <Text fontSize="xl">Total Bookings</Text>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box borderWidth="1px" borderRadius="md" p={4} boxShadow="md" textAlign="center">
                            <Text fontSize="2xl" color="blue.500">{totalEarnings}</Text>
                            <Text fontSize="xl">Earnings</Text>
                        </Box>
                    </GridItem>
                </SimpleGrid>
            </Box>

            <Box w="70%" h="400px" mt={10}>
            
            <ResponsiveContainer width="100%" height="100%" >
                <BarChart data={earningsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Earnings" fill="#3182CE" />
                    <Bar dataKey="bookings" fill="#2C5282" />
                </BarChart>
            </ResponsiveContainer>
        </Box>
            </VStack>
        </Box>
        </Flex>
    );
};
