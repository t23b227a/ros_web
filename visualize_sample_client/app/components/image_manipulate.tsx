"use client";
import React, { useEffect, useState, useRef } from 'react';

// ROS
import * as ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// フィールドの寸法 (mm)
const FIELD_WIDTH = 15100; // 横幅
const FIELD_HEIGHT = 8100; // 縦幅

const TOPIC_NAME = '/goal_pose';

const ImageManipulation: React.FC = () => {
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
    const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
    const { ros, rosConnected } = useROS();
    const [targetPublisher, setTargetPublisher] = useState<ROSLIB.Topic | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();

        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const relativeX = clickX / rect.width;  // 0 ～ 1
        const relativeY = clickY / rect.height; // 0 ～ 1

        // 相対座標（左上が(0,0)） → 実フィールド座標へ変換（中心原点）
        const fieldX = (relativeX - 0.5) * FIELD_WIDTH / 1000 * -1; // m
        const fieldY = (0.5 - relativeY) * FIELD_HEIGHT / 1000;     // m

        setClickPosition({ x: clickX, y: clickY });
        setTargetPosition({ x: fieldY, y: fieldX });
    };

    useEffect(() => {
        if (!targetPosition || !targetPublisher) return;

        const message = new ROSLIB.Message({
            header: {
                stamp: { sec: 0, nsec: 0 },
                frame_id: "map",
            },
            pose: {
                position: {
                    x: targetPosition.x,
                    y: targetPosition.y,
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
        targetPublisher.publish(message);
    }, [targetPosition]);

    return (
        <div>
            {/* フィールド画像 */}
                <div
                    ref={containerRef}
                    onClick={handleClick}
                    style={{
                        position: 'relative',
                        width: `58vw`,
                        height: `31.11vw`,
                        backgroundImage: 'url(/ABU2025_field.png)',
                        backgroundSize: 'cover',
                        cursor: 'crosshair',
                        // border: '1px solid black',
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
                            width: "8px",
                            height: "8px",
                            backgroundColor: "red",
                            borderRadius: "50%", // 円形
                            pointerEvents: "none", // クリックを無効化
                        }}
                    ></div>
                )}
            </div>

            {/* 座標出力 */}
            <div style={{ display: 'flex' }} >
                <p style={{ margin: '0 auto' }}>
                    X座標: {targetPosition?.x.toFixed(5)} m <br />
                    Y座標: {targetPosition?.y.toFixed(5)} m
                </p>
            </div>
        </div>
    );
};

export default ImageManipulation;
