"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// Bootstrap
import { Container, Row, Col } from 'react-bootstrap';

// Image (string) topic name
const TOPIC_NAME_IMAGE = '/image/converted';

// String 型
export interface String {
    data: string;
}

const Camera: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [camera, setCamera] = useState<ROSLIB.Topic | null>(null);
    const [receivedImage, setReceivedImage] = useState<string>('');
    // 以前に読み込まれた画像データ
    const [prevSrc, setPrevSrc] = useState<string>('');    // NOTE: revokeでメモリ解放を行うために利用

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
        camera.subscribe((msg: ROSLIB.Message) => {
            setBlob('data:image/jpeg;base64,' + (msg as String).data);  //data URI
        });
    }, [camera]);

    const setBlob = async (dataUri: string) => {
        // Data URL から新たなblobを設定
        const blob = await (await fetch(dataUri)).blob();
        let newSrc = window.URL.createObjectURL(blob);
        setReceivedImage(newSrc);
        // 以前のデータを解放する
        if (prevSrc !== '') { window.URL.revokeObjectURL(prevSrc); }
        setPrevSrc(newSrc);
    };

    return (
        <>
            <Container>
                <Row>
                    <Col>
                        <img src={receivedImage} width={600} />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Camera;