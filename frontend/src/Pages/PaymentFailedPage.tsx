import {Box, Button, Heading, Image, VStack} from "@chakra-ui/react";
import { AuthCard } from "../components/AuthCard";
import { FaTimesCircle } from "react-icons/fa";  // Importing failure icon
import logo from '../images/logowhite.png';
import { motion } from "framer-motion";  // For simple animation
import { useNavigate } from "react-router-dom";


export const PaymentFailedPage = () => {
    const navigate = useNavigate();

    return (
        <Box bg="blue.200" minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack gap={6}>
                <Image src={logo} alt="Logo" width="30%" paddingBottom="5"/>
                <AuthCard>
                    <VStack gap={6}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <FaTimesCircle size="100px" color="red" />
                        </motion.div>
                        <Heading color="red.500">Payment Failed</Heading>
                        <Box>
                            Unfortunately, your payment could not be processed. Please try again later or contact support.
                        </Box>
                        <Button colorScheme="blue" onClick={() => navigate('/bookings')}>
                            Go to My Bookings
                        </Button>
                    </VStack>
                </AuthCard>
            </VStack>
        </Box>
    );
};
