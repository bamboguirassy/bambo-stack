import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { getToken } from '../services/DaoService';
import { useUserContext } from './UserProvider';

const PusherContext = createContext(null);

export const PusherProvider = ({ children }) => {
    const [pusher, setPusher] = useState(null);
    const { currentUser } = useUserContext();

    useEffect(() => {
        if (currentUser) {
            const pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
                cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
                forceTLS: true,
                authEndpoint: `${process.env.REACT_APP_API_URL}/broadcasting/auth`,
                auth: {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json',
                    }
                },
                channelAuthorization: {
                    endpoint: `${process.env.REACT_APP_API_URL}/broadcasting/auth/channel`,
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json',
                    },
                    params: {
                        token: getToken(),
                    }
                }
            });

            pusherInstance.connection.bind('error', (err) => {
                console.error('Pusher connection error:', err);
            });

            // pusherInstance.connection.bind('state_change', (states) => {
            //     console.log('Pusher connection state change:', states);
            // });

            // pusherInstance.connection.bind('connected', () => {
            //     console.log('Pusher connection success');
            // });

            setPusher(pusherInstance);

            return () => {
                pusherInstance.disconnect();
            };
        }
    }, [currentUser]);

    return (
        <PusherContext.Provider value={pusher}>
            {children}
        </PusherContext.Provider>
    );
};

export const usePusher = () => {
    return useContext(PusherContext);
};
