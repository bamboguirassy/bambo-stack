// UserProvider.js

import React, { createContext, useCallback, useContext } from 'react';
import UserService from '../services/UserService';
import { catchError } from '../services/DaoService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = React.useState(null);

    const getCurrentUser = useCallback(() => {
        UserService.getInstance()
            .getCurrentUser()
            .then((response) => {
                setCurrentUser(response.data);
            }).catch(err=>catchError(err));
    }, []);

    const check = useCallback((permission)=>{
        if(currentUser) {
            // verifier si l'utilisateur a la permission
            return currentUser.permissions.includes(permission) || currentUser.is_admin;
        }
    },[currentUser])

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, getCurrentUser, check }}>
            {children}
        </UserContext.Provider>
    );
}


export const useUserContext = () => useContext(UserContext);