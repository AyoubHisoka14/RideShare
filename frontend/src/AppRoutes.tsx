import {Navigate, Route, RouteProps, Routes} from "react-router-dom";
import React from "react";
import {RegisterPage} from "./Pages/RegisterPage.tsx";
import {LoginPage} from "./Pages/LoginPage.tsx";
import {HomePage} from "./Pages/HomePage.tsx";
import {useAuth} from "./provider/AuthProvider.tsx";
import {MyVehiclesPage} from "./Pages/MyVehiclesPage.tsx";
import {MyBookingsPage} from "./Pages/MyBookingsPage.tsx";
import {DashboardPage} from "./Pages/DashboardPage.tsx";
import { ProfilePage } from "./Pages/ProfilePage.tsx";
import { ProfileEdit } from "./Pages/ProfileEdit.tsx";
import { ManageBookingsPage } from "./Pages/ManageBookingsPage.tsx";
import {PaymentSuccessPage} from "./Pages/PaymentSuccesspage.tsx";
import {PaymentFailedPage} from "./Pages/PaymentFailedPage.tsx";

export type RouteConfig = RouteProps & { isPrivate: boolean };

export const routes: RouteConfig[] = [
    { path: "/register", element: <RegisterPage />, isPrivate: false},
    { path: "/login", element: <LoginPage />, isPrivate: false},
    { path: "/", element: <HomePage />, isPrivate: true},
    { path: "/vehicles", element: <MyVehiclesPage />, isPrivate: true},
    { path: "/bookings", element: <MyBookingsPage />, isPrivate: true},
    { path: "/dashboard", element: <DashboardPage />, isPrivate: true},
    { path: "/profile", element: <ProfilePage />, isPrivate: true},
    { path: "/edit-profile", element: <ProfileEdit />, isPrivate: true},
    { path: "/manage-bookings", element: <ManageBookingsPage />, isPrivate: true},
    { path: "/payment-success", element: <PaymentSuccessPage />, isPrivate: true},
    { path: "/payment-failed", element: <PaymentFailedPage />, isPrivate: true},



];

export const AuthRequired = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={"/login"} />;
    }
    return <>{children}</>;
};

const renderRouter = ({ isPrivate, element, ...restRoute }: RouteConfig) => {
    const authRequiredElement = isPrivate ? (
        <AuthRequired>{element}</AuthRequired>
    ) : (
        element
    );
    return (
        <Route key={restRoute.path} {...restRoute} element={authRequiredElement} />
    );
};

export const AppRoutes = () => {
    return <Routes>{routes.map((route) => renderRouter(route))}</Routes>;
};
