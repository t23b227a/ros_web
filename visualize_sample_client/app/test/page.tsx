"use client";
import React, { useEffect, useState } from 'react';
import * as ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

const Test: React.FC = () => {

    // 表示
    return (
        <div>
            <h1>Test Page.</h1>
            <div style={{ display: 'flex', justifyContent: 'flex-end' ,backgroundColor: 'lightgray' }}>
                <div style={{ backgroundColor: 'red', width: '50px', height: '50px'}}></div>
                <div style={{ backgroundColor: 'green', width: '50px', height: '50px'}}></div>
                <div style={{ backgroundColor: 'blue', width: '50px', height: '50px'}}></div>
            </div>
        </div>
    );
};

export default Test;