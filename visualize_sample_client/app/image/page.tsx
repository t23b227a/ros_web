"use client";
import React, { useEffect, useState } from 'react';

// Bootstrap
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// ROS
import * as ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// フィールドの寸法 (mm)
const FIELD_WIDTH = 15100; // 横幅
const FIELD_HEIGHT = 8100; // 縦幅

// 画像の幅と高さ (ピクセル)
const IMAGE_WIDTH = 800; // 表示画像の幅（px）
const IMAGE_HEIGHT = 430; // 表示画像の高さ（px）

const TOPIC_NAME = '/goal_pose';

const ImageManipulation: React.FC = () => {
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
    const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
    const { ros, rosConnected } = useROS();
    const [targetPublisher, setTargetPublisher] = useState<ROSLIB.Topic | null>(null);

    // ROS オブジェクト更新時に Listener & Sender を更新
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setTargetPublisher(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME,
                messageType: 'geometry_msgs/PoseStamped',
            })
        );
    }, [ros, rosConnected]);

    // クリック処理
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();

        // クリック位置を画像内の座標に変換（ピクセル単位）
        const pixel_x = event.clientX - rect.left;
        const pixel_y = event.clientY - rect.top;

        // 中心基準のピクセル座標
        const relativePixelX = pixel_x - IMAGE_WIDTH / 2;
        const relativePixelY = IMAGE_HEIGHT / 2 - pixel_y;

        // ピクセル座標を実フィールドの座標（mm）に変換
        const real_x = (relativePixelX / IMAGE_WIDTH) * FIELD_WIDTH / 1000;
        const real_y = (relativePixelY / IMAGE_HEIGHT) * FIELD_HEIGHT / 1000;

        // 状態を更新
        setTargetPosition({ x: real_y, y: real_x });
        setClickPosition({x: pixel_x, y: pixel_y});
    };

    useEffect(() => {
        const message = new ROSLIB.Message({
            header: {
                stamp: { sec: 0, nsec: 0 },
                frame_id: "map",
            },
            pose: {
                position: {
                    x: targetPosition?.x,
                    y: targetPosition?.y,
                    z: 0.0,
                },
                orientation: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                    w: 1.0,
                },
            },
        });
        targetPublisher?.publish(message);
    },[targetPosition])

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>ロボットコントローラー</h1>

            {/* フィールド画像 */}
            <div
                onClick={handleClick}
                style={{
                position: 'relative',
                width: `${IMAGE_WIDTH}px`,
                height: `${IMAGE_HEIGHT}px`,
                backgroundImage: 'url(/ABU2025_field.png)',
                backgroundSize: 'cover',
                cursor: 'crosshair',
                border: '1px solid black',
                margin: '0 auto',
                }}
            >
                {/* マーカー */}
                {clickPosition && (
                <div
                    style={{
                    position: "absolute",
                    top: `${clickPosition.y - 5}px`, // マーカー中心を合わせる
                    left: `${clickPosition.x - 5}px`,
                    width: "10px",
                    height: "10px",
                    backgroundColor: "red",
                    borderRadius: "50%", // 円形
                    pointerEvents: "none", // クリックを無効化
                    }}
                ></div>
            )}
        </div>

        {/* 座標出力 */}
        {targetPosition && clickPosition && (
            <Row>
                <Col sm={{ span: 2, offset: 4 }}>
                    <p>X座標: {targetPosition.x.toFixed(5)} m</p>
                </Col>
                <Col sm={2}>
                    <p>Y座標: {targetPosition.y.toFixed(5)} m</p>
                </Col>
            </Row>
        )}
        </div>
    );
};

export default ImageManipulation;
