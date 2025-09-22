import {AuthCard} from "../components/AuthCard.tsx";
import {Box, FormLabel, Heading, Image, Link, useToast, VStack} from "@chakra-ui/react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {InputControl, SubmitButton} from "formik-chakra-ui";
import {Form, Formik} from "formik";
import {object, string} from "yup";
import {useAuth} from "../provider/AuthProvider.tsx";
import {useState} from "react";
import logo from "../images/logowhite.png";

export type RegisterFormValues = {
    userName: string;
    email: string;
    password: string;
};

const initialValues: RegisterFormValues = {
    userName: "",
    email: "",
    password: "",
};

const RegisterUserSchema = object({
    userName: string().required("Please Enter your Full Name"),
    email: string().required("Please Enter your E-Mail"),
    password: string()
        .min(8, "Please Enter at least 8 charachters")
        .required("Please Enter a password"),
});

export const RegisterPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    return (
        <Box bg="blue.200" minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack gap={6}>
                <Image src={logo} alt="Logo" width="30%" paddingBottom="5"/>
                <AuthCard>
                    <VStack gap={6}>
                        <Heading>Register</Heading>
                        <Formik<RegisterFormValues>
                            validationSchema={RegisterUserSchema}
                            initialValues={initialValues}
                            onSubmit={async (values, actions) => {
                                console.log("onSubmit triggered", values); // Debugging
                                let formData;
                                try {
                                    if (!file) {
                                        toast({
                                            title: "Error",
                                            description: "Please add an Image",
                                            status: "error",
                                            duration: 3000,
                                            isClosable: true,
                                        });
                                        return
                                    }
                                    formData = new FormData();
                                    formData.append("username", values.userName);
                                    formData.append("email", values.email);
                                    formData.append("password", values.password);
                                    formData.append("image", file);

                                    const httpRes = await fetch('/api/users/register', {
                                        method: "POST",
                                        body: formData,

                                    });

                                    if (!httpRes.ok) {
                                        const res = await httpRes.json();
                                        console.error("Error response:", res.error); // Debugging
                                        toast({
                                            title: "Error",
                                            description: "Account was not created successfully. Please try again",
                                            status: "error",
                                            duration: 3000,
                                            isClosable: true,
                                        });
                                    } else {
                                        toast({
                                            title: "Success",
                                            description: "Account created successfully",
                                            status: "success",
                                            duration: 3000,
                                            isClosable: true,
                                        });
                                        navigate('/login');
                                    }
                                } catch (error) {
                                    console.error("Submission error:", error); // Debugging
                                    toast({
                                        title: "Error",
                                        description: "Something went wrong. Please try again",
                                        status: "error",
                                        duration: 3000,
                                        isClosable: true,
                                    });
                                } finally {
                                    actions.setSubmitting(false);
                                }
                            }}
                        >
                            <VStack as={Form}>
                                <InputControl label="Full Name" name="userName"/>
                                <InputControl label="Email" name="email"/>
                                <InputControl
                                    label="Password"
                                    name="password"
                                    inputProps={{type: "password"}}
                                />
                                <FormLabel htmlFor="image">Image</FormLabel>
                                <input type="file" name="image" onChange={handleFileChange}/>
                                <SubmitButton>Submit</SubmitButton>
                                <Box>
                                    You already have an Account?{" "}
                                    <Link as={RouterLink} to="/login">
                                        Login
                                    </Link>
                                </Box>
                            </VStack>
                        </Formik>
                    </VStack>
                </AuthCard>
            </VStack>
        </Box>
    );
};
