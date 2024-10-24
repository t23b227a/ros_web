'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import ROSLIB from 'roslib';

const ROS_CONNECTION_URL = 'ws://127.0.0.1:9090';

interface ROSContextType {
    ros: ROSLIB.Ros | null;
    rosConnected: boolean;
    connectToROS: () => void;
}

const ROSContext = createContext<ROSContextType | null>(null);

export const ROSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ros, setRosObject] = useState<ROSLIB.Ros | null>(null);
    const [rosConnected, setRosConnected] = useState(false);

    const connectToROS = () => {
        console.log('ROS Operator: Try connection...');
        setRosConnected(false);
        setRosObject(new ROSLIB.Ros({url: ROS_CONNECTION_URL}));
    };

    useEffect(() => {
        if (ros === null) return;
        ros.on('connection', () => {
        console.log('ROS Operator: ROS connected.');
        setRosConnected(true);
        });
        ros.on('error', (err) => {
        console.log('ROS Operator: ROS connection error, ', err);
        setRosConnected(false);
        });
        ros.on('close', () => {
        console.log('ROS Operator: ROS connection closed.');
        setRosConnected(false);
        });
        return () => {
        ros.close();
        };
    }, [ros]);

    return (
        <ROSContext.Provider value={{ ros, rosConnected, connectToROS }}>
            {children}
        </ROSContext.Provider>
    );
};

export const useROS = () => {
    const context = useContext(ROSContext);
    if (!context) {
        throw new Error('useROS must be used within a ROSProvider');
    }
    return context;
};