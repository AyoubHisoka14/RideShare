import { AuthCard } from "../components/AuthCard.tsx";  // A component for styling the authentication form.
import {Box, Heading, Image, Link, VStack} from "@chakra-ui/react";

import {Link as RouterLink} from "react-router-dom";
import { object, string } from "yup"; //A validation library for defining and validating schema objects.
import { Form, Formik } from "formik";  // A library for building forms in React with ease.
import { InputControl, SubmitButton } from "formik-chakra-ui";
import { LoginFormValues, useAuth } from "../provider/AuthProvider.tsx";
import logo from '../images/logowhite.png';


const initialValues: LoginFormValues = {
    email: "",
    password: "",
};

export const LoginUserSchema = object({
    email: string().required("Please enter your E-Mail"),
    password: string().required("Please enter your Password"),
});

export const LoginPage = () => {
    console.log('login');
    const { login } = useAuth();

    return (
        <Box bg="blue.200" minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack gap={6}>
                <Image src={logo} alt="Logo" width="30%" paddingBottom="5"/>
                <AuthCard>
                    <VStack gap={6}>
                        <Heading>Login</Heading>
                        <Formik<LoginFormValues>
                            initialValues={initialValues}
                            validationSchema={LoginUserSchema}
                            onSubmit={async (values, formikHelpers) => {
                                await login(values);
                                formikHelpers.setSubmitting(false);
                            }}
                        >
                            <VStack as={Form}>
                                <InputControl name={"email"} label={"Email"} />
                                <InputControl
                                    name={"password"}
                                    label={"Password"}
                                    inputProps={{ type: "password" }}
                                />
                                <SubmitButton>Submit</SubmitButton>
                            </VStack>
                        </Formik>
                        <Box>
                            You don't have an Account?{" "}
                            <Link as={RouterLink} to="/register">
                                Register
                            </Link>
                        </Box>
                    </VStack>
                </AuthCard>
            </VStack>
        </Box>

    );
};
