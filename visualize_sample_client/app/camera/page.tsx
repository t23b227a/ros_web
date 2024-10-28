"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

const TOPIC_NAME_IMAGE = 'camera';

// String 型
export interface String {
    data: string;
}

const Camera: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [camera, setCamera] = useState<ROSLIB.Topic | null>(null);
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setCamera(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_IMAGE,
                messageType: 'std_msgs/String',
            })
        );
    }, [rosConnected, ros]);

        // imageListener更新時に subscribe 設定
        useEffect(() => {
            // 初回表示時はオブジェクトが空なのでスキップ
            if (camera === null) { return; }
                // Image topic msg subscription event
                camera.subscribe((msg: ROSLIB.Message) => {
                    let image = msg as String;
            });
        }, [camera]);

    return (
        <></>
    );
}

export default Camera;