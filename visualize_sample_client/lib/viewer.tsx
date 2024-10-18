"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// TopicList
import topics from './topics.json';

// Bootstrap
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ChildComponentProps } from '@/app/page';
import ROSLIB from 'roslib';

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
}

//////////////////////////////////////////////////
/// Viewer                                     ///
//////////////////////////////////////////////////

const Viewer: React.FC<ChildComponentProps> = ({ ros }) => {
    // RosTopick
    const [topicList, setTopicList] = useState<TopicObject[]>([]);

    const formatMessage = (template: string, messageData: any): string => {
        return template.replace(/\$\{(\w+)\}/g, (match, key) => {
            return messageData[key] !== undefined ? messageData[key] : match;
        });
    }

    // JSONファイルからTopicリストを作成
    useEffect(() => {
        let topicArray: TopicObject[]= [];
        for (let topic_ of topics) {
            const newTopic = new ROSLIB.Topic({
                ros: ros,
                name: topic_.name,
                messageType: topic_.messageType,
            });
            topicArray.push({topic: newTopic, show: topic_.show});
        }
        setTopicList(topicArray);
    }, [ros])

    useEffect(() => {
        for (let topic_ of topicList) {
            topic_.topic.subscribe((msg: ROSLIB.Message) => {
                const message = msg as Message;
                updateLogArray(formatMessage(topic_.show, message));
            })
        }
    }, [topicList])

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