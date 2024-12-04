"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const TOPIC_NAME_IMAGE = 'camera';

// String 型
export interface String {
    data: string;
}

const Camera: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [camera, setCamera] = useState<ROSLIB.Topic | null>(null);
    const [imgData, setImgData] = useState('');

    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setCamera(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_IMAGE,
                messageType : 'sensor_msgs/CompressedImage',
            })
        );
    }, [rosConnected, ros]);

        // imageListener更新時に subscribe 設定
        useEffect(() => {
            // 初回表示時はオブジェクトが空なのでスキップ
            if (camera === null) { return; }
                // Image topic msg subscription event
                camera.subscribe((msg: ROSLIB.Message) => {
                    let image = "data:image/png;base64," + (msg as String).data;
                    setImgData(image);
            });
        }, [camera]);

    return (
        <>
            <Container>
                <Row>
                    <Col>
                        <img src={imgData} alt="Camera Data" width={600}/>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Camera;