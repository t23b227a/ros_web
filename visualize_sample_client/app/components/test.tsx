"use client";
import React, { useEffect, useState } from 'react';
import * as ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// Bootstrap
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Test: React.FC = () => {
    const { ros, rosConnected } = useROS();

    // ROS オブジェクト更新時に Listener & Sender を更新
    useEffect(() => {
        if (ros == null || !rosConnected) return;
    }, [ros, rosConnected]);

    // 表示
    return (
        <div>
            <h1>Test Page.</h1>
        </div>
    );
};

export default Test;