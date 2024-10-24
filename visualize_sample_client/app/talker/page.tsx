"use client";
import React, { useEffect, useState } from 'react';
import * as ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// Bootstrap
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Test string topic name
const TOPIC_NAME_TEST_STR = 'test_talker';

const Talker: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [testStrTalker, setTestStrTalker] = useState<ROSLIB.Topic | null>(null);

    // ROS オブジェクト更新時に Listener & Sender を更新
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setTestStrTalker(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_TEST_STR,
                messageType: 'std_msgs/String',
            })
        );
    }, [ros, rosConnected]);

    const send = () => {
        let str = new ROSLIB.Message({data : comment});
        testStrTalker?.publish(str);
    };

    const [comment, setComment] = useState('');
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // フォーム送信（ページリロード）を防ぐ
        send();
        console.log(comment);
    };

    // 表示
    return (
        <>
            <h2>Topic: {TOPIC_NAME_TEST_STR}, MessageType: std_msgs/String</h2>
            <Form onSubmit={handleSubmit} id="ui">
                <Form.Group controlId="comment">
                    <Form.Label>Comment:</Form.Label>
                    <Form.Control
                        type="text"
                        size="sm"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)} // 入力値をstateに反映
                    />
                </Form.Group>
                <Button variant="primary" type="submit" id="btn">
                    Send
                </Button>
            </Form>
        </>
    );
};

export default Talker;