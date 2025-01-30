"use client";
// React
import React, { useState, useEffect } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

import '@/app/styles/button.css';

const MyButton: React.FC<{ children: React.ReactNode, topicName: string }> = ({ children, topicName }) => {
    const { ros, rosConnected } = useROS();
    const [button, setButton] = useState<ROSLIB.Topic | null>(null);
    const [isPressed, setIsPressed] = useState(false);
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setButton(
            new ROSLIB.Topic({
                ros: ros,
                name: topicName,
                messageType: 'std_msgs/Bool',
            })
        );
    }, [rosConnected, ros]);
    useEffect(() => {
        if (!rosConnected) return;
        const message = new ROSLIB.Message({
            data: isPressed
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