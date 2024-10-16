"use client";
import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';

// Bootstrap
import { Container, Row, Col } from 'react-bootstrap';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// ROS接続URL
const ROS_CONNECTION_URL = 'ws://127.0.0.1:9090';

// Test string topic name
const TOPIC_NAME_TEST_STR = 'test_talker';

const Talker = () => {
    // ROSLIB object
    const [ros, setRosObject] = useState<ROSLIB.Ros | null>(null);

    // ROS 接続状態
    const [rosConnected, setRosConnected] = useState<boolean>(false);

    // Topick
    const [testStrTalker, setTestStrTalker] = useState<ROSLIB.Topic | null>(null);

    // Connect to ROS ... ROSとの接続を開始する
    const connectToROS = () => {
        // 接続開始
        console.log('ROS Talker: Try connection...');
        setRosConnected?.(false);
        // Initialize ROS connection object
        setRosObject(new ROSLIB.Ros({url:ROS_CONNECTION_URL}));
    };

    // ROS オブジェクト更新時に Listener & Sender を更新
    useEffect(() => {
        // 初回表示時は ROS オブジェクトが null なのでスキップ
        if (ros === null) { return; }
        // 接続完了検知 or エラー検知
        ros.on('connection', () => {
            console.log('ROS Operator: ROS connected.');
            setRosConnected?.(true);
        });
        ros.on('error', (err) => {
            console.log('ROS Operator: ROS connection error, ', err);
            setRosConnected?.(false);
        });
        ros.on('close', () => {
            console.log('ROS Operator: ROS connection closed.');
            setRosConnected?.(false);
        });
        setTestStrTalker(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_TEST_STR,
                messageType: 'std_msgs/String',
            })
        );
    }, [ros]);

    const send = () => {
        let str = new ROSLIB.Message({data : comment});
        testStrTalker?.publish(str);
    };

    const [comment, setComment] = useState('');
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // フォーム送信（ページリロード）を防ぐ
        send();
        console.log(comment); // テスト用にコンソール出力
    };

    // 表示
    return (
        <>
            <Button
                variant={!rosConnected ? "primary" : "secondary"}
                disabled={rosConnected}
                onClick={!rosConnected ? connectToROS : undefined}
            >
                ROS接続開始
            </Button>
            <h1>ROS {rosConnected ? "Connected" : "Disconnect"}</h1>
            <h2>Topic: {TOPIC_NAME_TEST_STR}, MessageType: std_msgs/String</h2>
            <form onSubmit={handleSubmit} id="ui">
            <label htmlFor="comment">Comment: </label>
            <input
                type="text"
                id="comment"
                size={20}
                value={comment}
                onChange={(e) => setComment(e.target.value)} // 入力値をstateに反映
            />
            <input type="submit" value="send" id="btn" />
            <br/>
            </form>
        </>
    );
};

export default Talker;