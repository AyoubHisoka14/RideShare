import {ChakraProvider} from '@chakra-ui/react';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from "../src/provider/AuthProvider";
import {render} from '@testing-library/react';
import { ReactElement, ReactNode} from 'react';
import React from 'react';


const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
        <ChakraProvider>
            <BrowserRouter>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </BrowserRouter>
        </ChakraProvider>
    );
};

const customRender = (ui: ReactElement, options = {}) =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

export { customRender as render };
