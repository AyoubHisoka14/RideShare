import {Box, Center} from "@chakra-ui/react";

export const AuthCard = ({children}: { children: React.ReactNode }) => {
    return (
        <Center h="full">
            <Box
                minH="400px"
                w="400px"
                borderRadius="lg"
                boxShadow="md"
                p={4}
                bg="white"
                _dark={{bg: "gray.700"}}
            >
                {children}
            </Box>
        </Center>
    );
};
