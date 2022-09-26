import { FC, useReducer, PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession,signOut } from 'next-auth/react'
import Cookies from 'js-cookie';
import axios from 'axios';

import { Email } from '@mui/icons-material';

import { AuthContext, authReducer } from './';
import { IUser } from 'interfaces';
import { tesloApi } from 'axios-api';

export interface AuthState {
    isLoggedIn: boolean;
    user?: IUser;
}

const AUTH_INITIAL_STATE: AuthState = {
    isLoggedIn: false,
    user: undefined
}

export const AuthProvider:FC<PropsWithChildren> = ({ children }) => {

    const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE)
    const { data, status } = useSession();
    const router = useRouter()

    useEffect(() => {
        if ( status === 'authenticated' ) {
            // console.log({user: data?.user});
            dispatch({ type: '[Auth] - Login', payload: data?.user as IUser })
        }

    }, [ status, data ])

    // useEffect(() => {
    //     checkToken()
    // }, [])

    const checkToken = async() => {

        if ( !Cookies.get('token')) {
            return;
        }
        try {
            // llamar al endpoint
            const { data } = await tesloApi.get('/user/validate-token')
            // Revalidar token guardando el nuevo
            const { token, user } = data;
            Cookies.set('token', token)
            // Dispatch login
            dispatch({ type: '[Auth] - Login', payload: user })
        } catch (error) {
            Cookies.remove('token')
        }

    }


    const loginUser = async( email: string, password: string ):Promise<boolean> => {

        try {
            const { data } = await tesloApi.post('/user/login', { email, password })
            const { token, user } = data;
            Cookies.set('token', token );
            dispatch({ type: '[Auth] - Login', payload: user })
            return true
        } catch (error) {
            return false;
        }
    }

    const registerUser = async( name: string, email: string, password: string ):Promise<{hasError: boolean; message?: string}> => {
        try {
            const { data } = await tesloApi.post('/user/register', { name, email, password })
            const { token, user } = data;
            Cookies.set('token', token );
            dispatch({ type: '[Auth] - Login', payload: user })
            return {
                hasError: false
            }
        } catch (error) {
            if ( axios.isAxiosError(error) ) {
                return {
                    hasError: true,
                    message: error.message
                }
            }

            return {
                hasError: true,
                message: 'No se pudo crear el usuario - intente de nuevo'
            }
        }
    }

    const logout = () => {
        Cookies.remove('cart');
        Cookies.remove('firstName');
        Cookies.remove('lastName');
        Cookies.remove('address');
        Cookies.remove('address2');
        Cookies.remove('zip');
        Cookies.remove('city');
        Cookies.remove('country');
        Cookies.remove('phone');

        signOut();
        // Cookies.remove('token');
        // router.reload();
    }



    return (
        <AuthContext.Provider value={{
            ...state,

            // methods
            loginUser,
            registerUser,
            logout,
        }}>
            { children }
        </AuthContext.Provider>
    )
}
