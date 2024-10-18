"use client";
// React
import React, { useRef, useState, useEffect, useCallback } from 'react';

// Bootstrap
import { Container, Row, Col, Form, Button, Stack } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ChildComponentProps } from '@/app/page';
import ROSLIB from 'roslib';

// Test string topic name
// const TOPIC_NAME_TEST_STR = 'test_message';
const TOPIC_NAME_TEST_STR = 'test_talker';

// String 型
export interface String {
    data: string;
}

// Log 型
interface Log {
    level: number;   // ログレベル
    name: string;    // ノード名
    msg: string;     // メッセージ内容
}

type NewTopic = {
    name: string
    messageType: string
}

//////////////////////////////////////////////////
/// Viewer                                     ///
//////////////////////////////////////////////////

const Viewer: React.FC<ChildComponentProps> = ({ ros }) => {
    // RosTopick
    const [testStrListener, setTestStrListener] = useState<ROSLIB.Topic | null>(null);
    const [logListener, setLogListener] = useState<ROSLIB.Topic | null>(null);
    const [newTopic, setNewTopic] = useState<NewTopic>({ name: '', messageType: '' })
    // ROS オブジェクト更新時に RosTopick を更新
    useEffect(() => {
        // topic listener
        setTestStrListener(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_TEST_STR,
                messageType: 'std_msgs/String',
            })
        );
        // LogListener
        setLogListener(
            new ROSLIB.Topic({
                ros: ros,
                name: '/rosout',
                messageType: 'rcl_interfaces/msg/Log',
            })
        );
    }, [ros]);
    const subscribeToTopic = useCallback((topicName: string, messageType: string) => {
        if (!ros) { return; }
        const listener = new ROSLIB.Topic({
            ros: ros,
            name: topicName,
            messageType: messageType
        })
        listener.subscribe((message: any) => {
            updateLogArray((message as String).data);
        })
    }, [ros])
    useEffect(() => {
        if (ros) {
            subscribeToTopic('/chatter', 'std_msgs/String')
        }
    }, [ros, subscribeToTopic])
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(newTopic);
        if (newTopic.name && newTopic.messageType) {
            subscribeToTopic(newTopic.name, newTopic.messageType)
            setNewTopic({ name: '', messageType: '' })
        } else {
            console.log('Failed to add topic.');
        }
    }
    // testStrListener更新時にsubscribe設定
    useEffect(() => {
        // 初回表示時はオブジェクトが空なのでスキップ
        if (testStrListener === null) { return; }
        // Test string topic msg subscription event
        testStrListener.subscribe((msg: ROSLIB.Message) => {
            updateLogArray((msg as String).data);
        });
    }, [testStrListener]);
    // LogListener更新時にsubscribe設定
    useEffect(() => {
        if (logListener === null) { return; }
        logListener.subscribe((msg: ROSLIB.Message) => {
            const logMessage = msg as Log;
            updateLogArray(`[${logMessage.level}] ${logMessage.name}: ${logMessage.msg}`);
        });
    }, [logListener])

    // LogArray
    const [LogArray, setLogArray] = useState<string[]>([]);
    // 新しいログが来たときに配列に追加する
    const updateLogArray = (newLog: string) => {
        setLogArray(prevEntries => [...prevEntries, newLog]);
    };

    // Log表示に関する設定
    const logContainerRef = useRef<any>(null);
    const logEndRef = useRef<any>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // スクロール位置を確認して、一番下にいるかどうかをチェック
    const handleScroll = () => {
        const {scrollTop, scrollHeight, clientHeight} = logContainerRef.current;
        // 現在のスクロール位置と高さを比較して、ユーザーが一番下にいるか判定
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            setAutoScroll(true);  // 一番下にいる場合は自動スクロールを許可
        } else {
            setAutoScroll(false); // 一番下にいない場合は自動スクロールを停止
        }
    };

    // testLogArrayが更新されるたびに自動スクロールを実行（必要な場合のみ）
    useEffect(() => {
        if (autoScroll) {
            logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [LogArray, autoScroll]);

    // 表示
    return (
        <>
            <Container>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col>
                            <Form.Group controlId="formTopicName">
                                <Form.Label>Topic Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Topic Name"
                                    value={newTopic.name}
                                    onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="formMessageType">
                                <Form.Label>Message Type</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Message Type"
                                    value={newTopic.messageType}
                                    onChange={(e) => setNewTopic(prev => ({ ...prev, messageType: e.target.value }))}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button variant="primary" type="submit">
                                Add Topic
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <Row>
                    <Col>
                        <h2>ログ表示</h2>
                        <div ref={logContainerRef}
                            onScroll={handleScroll}
                            style={{maxHeight: '300px', overflowY: 'auto', background: '#f8f9fa', padding: '10px', border: '1px solid #ddd',}}
                        >
                            {LogArray.map((entry, index) => (
                                <div key={index}>{entry}</div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};
export default Viewer;