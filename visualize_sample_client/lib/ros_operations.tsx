import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';

///////////////////////////////////////////////////
/// Settings                                    ///
///////////////////////////////////////////////////

// ROS接続URL
const ROS_CONNECTION_URL = 'ws://127.0.0.1:9090';

// Test string topic name
// const TOPIC_NAME_TEST_STR = 'test_message';
const TOPIC_NAME_TEST_STR = 'test_talker';

///////////////////////////////////////////////////
/// Interfaces                                  ///
///////////////////////////////////////////////////

// String 型
export interface String {
    data: string;
}

// Log 型
export interface Log {
    level: number;   // ログレベル
    name: string;    // ノード名
    msg: string;     // メッセージ内容
}

///////////////////////////////////////////////////
/// ROS Operator                                ///
///////////////////////////////////////////////////

interface RosOperatorProps {
    setRosConnected: (connected: boolean) => void;
    updateLog: (logArray: string) => void;
}

const RosOperator = forwardRef((props: RosOperatorProps, ref) => {
    // 上位モジュールから呼び出される処理
    useImperativeHandle(ref, () => ({
        // ROSとの接続
        connect: () => {
            connectToROS();
        },
    }));
    // ROSLIB object
    const [ros, setRosObject] = useState<ROSLIB.Ros | null>(null);
    // Test string topic listener
    const [testStrListener, setTestStrListener] = useState<ROSLIB.Topic | null>(null);
    const [logListener, setLogListener] = useState<ROSLIB.Topic | null>(null);
    // Connect to ROS ... ROSとの接続を開始する
    const connectToROS = () => {
        // 接続開始
        console.log('ROS Operator: Try connection...');
        props.setRosConnected?.(false);  // NOTE: 上位モジュールのROS接続確認フラグをOFF
        // Initialize ROS connection object
        setRosObject(new ROSLIB.Ros({url:ROS_CONNECTION_URL}));
    };

    // ROS オブジェクト更新時に Listener & Sender を更新
    useEffect(() => {
        // 初回表示時は ROS オブジェクトが null なのでスキップ
        if (ros === null) { return; }
        // 接続完了検知 or エラー検知
        // NOTE: 検知時に上位モジュールにフラグ通知
        ros.on('connection', () => {
            console.log('ROS Operator: ROS connected.');
            props.setRosConnected?.(true);
        });
        ros.on('error', (err) => {
            console.log('ROS Operator: ROS connection error, ', err);
            props.setRosConnected?.(false);
        });
        ros.on('close', () => {
            console.log('ROS Operator: ROS connection closed.');
            props.setRosConnected?.(false);
        });
        // Test string topic listener
        setTestStrListener(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_TEST_STR,
                messageType: 'std_msgs/String',
            })
        );
        // ログのListener
        setLogListener(
            new ROSLIB.Topic({
                ros: ros,
                name: '/rosout',
                messageType: 'rcl_interfaces/msg/Log',
            })
        );
    }, [ros]);

    // testStrListener更新時 に subscribe 設定
    useEffect(() => {
        // 初回表示時はオブジェクトが空なのでスキップ
        if (testStrListener === null) { return; }
        // Test string topic msg subscription event
        testStrListener.subscribe((msg: ROSLIB.Message) => {
            // 上位モジュールへ通知
            props.updateLog?.((msg as String).data);
        });
    }, [testStrListener]);
    // Log の subscribe
    useEffect(() => {
        if (logListener === null) { return; }
        logListener.subscribe((msg: ROSLIB.Message) => {
            const logMessage = msg as Log;
            props.updateLog?.(`[${logMessage.level}] ${logMessage.name}: ${logMessage.msg}`);
        });
    }, [logListener])

    return (
        <></>    // 表示は無し
    );
});

RosOperator.displayName = 'RosOperator';
export default RosOperator;