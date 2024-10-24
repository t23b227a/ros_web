"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// TopicList
import topics from '@/lib/topics.json';

// Bootstrap
import { Container, Row, Col, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// 随時追加が必要かも
interface Message {
    data?: string;
    level?: number;
    name?: string;
    msg?: string;
}

interface TopicObject {
    topic: ROSLIB.Topic;
    show: string;
    selected: boolean;
}

//////////////////////////////////////////////////
/// Viewer                                     ///
//////////////////////////////////////////////////

const Viewer: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [topicList, setTopicList] = useState<TopicObject[]>([]);

    // JSONファイルからTopicリストを作成
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        let topicArray: TopicObject[]= [];
        for (let topic_ of topics) {
            const newTopic = new ROSLIB.Topic({
                ros: ros,
                name: topic_.name,
                messageType: topic_.messageType,
            });
            topicArray.push({topic: newTopic, show: topic_.show, selected: false});
        }
        setTopicList(topicArray);
    }, [ros, rosConnected])

    const formatMessage = (template: string, messageData: any): string => {
        return template.replace(/\$\{(\w+)\}/g, (match, key) => {
            return messageData[key] !== undefined ? messageData[key] : match;
        });
    }

    // LogArray
    const [LogArray, setLogArray] = useState<string[]>([]);
    // 新しいログが来たときに配列に追加する
    const updateLogArray = (newLog: string) => {
        setLogArray((prevEntries) => {
            return [...prevEntries, newLog]});
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

    const callbackRefs = useRef<Map<string, (message: ROSLIB.Message) => void>>(new Map());

    const handleCheckboxChange = (option: TopicObject) => {
        option.selected = !option.selected;
        const topicName = option.topic.name;
        if (option.selected) {
            const subCallback = (message: ROSLIB.Message) => {
                updateLogArray(formatMessage(option.show, message as Message));
            }
            callbackRefs.current.set(topicName, subCallback);
            option.topic.subscribe(subCallback);
        } else {
            const callback = callbackRefs.current.get(topicName);
            if (callback) {
                option.topic.unsubscribe(callback);
                callbackRefs.current.delete(topicName);
            }
        }
    };

    // 表示
    return (
        <>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={9} lg={10}>
                        <h2 className="text-center mb-3">ログ表示</h2>
                        <div
                            ref={logContainerRef}
                            onScroll={handleScroll}
                            style={{
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            background: '#f8f9fa',
                            padding: '10px',
                            border: '1px solid #ddd',
                            marginBottom: '20px'
                            }}
                        >
                            {LogArray.map((entry, index) => (
                            <div key={index}>{entry}</div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </Col>
                    <Col xs={12} md={3} lg={2}>
                        <h4 className="mb-3">topic選択</h4>
                        <Form>
                            {topicList.map((option) => (
                            <Form.Check
                                key={option.topic.name}
                                type="checkbox"
                                id={option.topic.name}
                                label={option.topic.name}
                                onChange={() => handleCheckboxChange(option)}
                                className="mb-2"
                            />
                            ))}
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
};
export default Viewer;