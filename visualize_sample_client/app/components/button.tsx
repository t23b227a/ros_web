"use client";
// React
import React, { useState, useEffect } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

import '@/app/styles/button.css';

const MyButton: React.FC<{ children: React.ReactNode, state: string }> = ({ children, state }) => {
    const { ros, rosConnected } = useROS();
    const [button, setButton] = useState<ROSLIB.Topic | null>(null);
    const [isPressed, setIsPressed] = useState(false);
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setButton(
            new ROSLIB.Topic({
                ros: ros,
                name: 'cmd_state',
                messageType: 'std_msgs/Int32',
            })
        );
    }, [rosConnected, ros]);
    useEffect(() => {
        if (!rosConnected || !isPressed) return;
        const message = new ROSLIB.Message({
            data: Number(state)
        });
        button?.publish(message);
        // console.log('Button is pressed: ', message);
    }, [isPressed]);

    return (
        <button
            className={`button ${isPressed ? 'pressed' : ''}`}
            onMouseDown={() => setIsPressed(true)}
            onTouchStart={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchEnd={() => setIsPressed(false)}
        >
            {children}
        </button>
    );
}

export default MyButton;