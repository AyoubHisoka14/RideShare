import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./provider/AuthProvider.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ChakraProvider>
            <BrowserRouter>
                <AuthProvider>
                    <App/>
                </AuthProvider>
            </BrowserRouter>
        </ChakraProvider>
    </React.StrictMode>,
)
