import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage.ts";
import { useToast } from "@chakra-ui/react";

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (loginValues: LoginFormValues) => Promise<void>;
    logout: () => void; // Add logout to the context type
    deleteAccount: () => Promise<void>;
    edit: (editValues: EditFormValues) => Promise<void>;
};

const authContext = createContext<AuthContextType | null>(null);

type User = {
    email: string;
    username: string;
    id: string;
    iat: number;
    exp: number;
    iss: string;
};

export type LoginFormValues = {
    email: string;
    password: string;
};

export type EditFormValues = {
    username: string;
    email: string;
    paypalEmail: string;
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useLocalStorage<string | null>("accessToken", null);
    const [user, setUser] = useState<User | null>(() => {
        if (accessToken) {
            try {
                const decodedUser = JSON.parse(atob(accessToken.split(".")[1])) as User;
                if (decodedUser.iss === "http://fwe.auth" && decodedUser.exp > Date.now() / 1000) {
                    return decodedUser;
                }
            } catch (error) {
                return null;
            }
        }
        return null;
    });

    const toast = useToast();
    const navigate = useNavigate();

    const updateUserFromToken = (token: string | null) => {
        if (token) {
            try {
                const decodedUser = JSON.parse(atob(token.split(".")[1])) as User;
                if (decodedUser.iss !== "http://fwe.auth" || decodedUser.exp < Date.now() / 1000) {
                    setAccessToken(null);
                    setUser(null);
                } else {
                    console.log(token);
                    console.log(decodedUser);
                    setUser(decodedUser);
                }
            } catch (error) {
                setAccessToken(null);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    const login = async (values: LoginFormValues) => {
        const httpRes = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: values.email,
                password: values.password,
            }),
        });
        const res = await httpRes.json();
        if (!httpRes.ok) {
            console.error("Error response:", res.error);
            toast({
                title: "Error",
                description: "Login Data not correct. Please try again",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Success",
                description: "Logged In successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setAccessToken(res.accessToken);
            updateUserFromToken(res.accessToken);
            navigate('/');
        }
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        navigate('/login'); // Redirect to the login page or another appropriate page
        toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const edit = async (values: EditFormValues) => {
        const httpRes = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: values.username,
                email: values.email,
                paypalEmail: values.paypalEmail,
            }),
        });
        const res = await httpRes.json();
        if (!httpRes.ok) {
            console.error("Error response:", res.error);
            toast({
                title: "Error",
                description: "Edit Data not correct. Please try again",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Success",
                description: "Edit successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setAccessToken(res.accessToken);
            updateUserFromToken(res.accessToken);
            navigate('/profile');
        }
    };


    const deleteAccount = async () => {
        if (!user) return;

        const httpRes = await fetch(`/api/users/${user.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (!httpRes.ok) {
            toast({
                title: "Error",
                description: "Could not delete account. Please try again later.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setAccessToken(null);
        setUser(null);
        navigate('/login'); // Redirect to the register page or another appropriate page
        toast({
            title: "Account Deleted",
            description: "Your account has been deleted successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const isAuthenticated = user !== null;

    return (
        <authContext.Provider value={{ accessToken, isAuthenticated, user, login, logout, edit, deleteAccount }}>
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => {
    const authValue = useContext(authContext);
    if (!authValue) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return authValue;
};
