"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// Bootstrap
import { Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// ROS Operator
import  RosOperator from '@/lib/ros_operations';

//////////////////////////////////////////////////
/// Viewer                                     ///
//////////////////////////////////////////////////

const Viewer = () => {
    // ROS operator ref
    const rosOpRef = useRef<any>(null!);

    // ROS 接続状態 (ROS Operatorにて更新)
    const [rosConnected, setRosConnected] = useState<boolean>(false);

    // Test string
    const [testLogArray, setLogArray] = useState<string[]>([]);

    // ROS接続開始
    const startConnect = () => {
        rosOpRef.current.connect();
    };

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
    }, [testLogArray, autoScroll]);

    // 表示
    return (
        <>
            {/* ROS Operator */}
            <RosOperator
                setRosConnected={setRosConnected}
                updateLog={updateLogArray}
                ref={rosOpRef}
            />

            <Container>
                {/* Title */}
                <Row>
                    <Col>
                        <h1>ROS2 data visualization sample</h1>
                    </Col>
                </Row>

                {/* Header ... ROS接続ボタンおよび接続状態確認 */}
                <Row>
                    <Col>
                        <Button
                            variant={!rosConnected ? "primary" : "secondary"}
                            disabled={rosConnected}
                            onClick={!rosConnected ? startConnect : undefined}
                        >
                            ROS接続開始
                        </Button>
                        <h2>ROS接続状態 ... {rosConnected ? 'ON' : 'OFF'}</h2>
                    </Col>
                </Row>

                {/* Logger ... ログ表示等 */}
                <Row>
                    <Col>
                        <h2>ログ表示</h2>
                        <div ref={logContainerRef}
                            onScroll={handleScroll}
                            style={{maxHeight: '300px', overflowY: 'auto', background: '#f8f9fa', padding: '10px', border: '1px solid #ddd',}}
                        >
                            {testLogArray.map((entry, index) => (
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