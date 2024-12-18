"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

import PointCloudViewer from '@/app/components/point_cloud_viewer';

const TOPIC_NAME_POINT_CLOUD = '/R1/scan_multi';

// LaserScan 型
export interface LaserScan {
    angle_min: number;  // 開始角度 (ラジアン)
    angle_max: number;  // 終了角度 (ラジアン)
    angle_increment: number; // 各点間の角度 (ラジアン)
    time_increment: number;  // 各点間の時間 (秒)
    scan_time: number;  // スキャン全体の時間 (秒)
    range_min: number;  // 測定可能な最小距離 (m)
    range_max: number;  // 測定可能な最大距離 (m)
    ranges: number[];   // 距離データ (m)
    intensities: number[]; // 強度データ (オプション)
}


const PointCloud: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [pointCloud, setPointCloud] = useState<ROSLIB.Topic | null>(null);
    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setPointCloud(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME_POINT_CLOUD,
                messageType: 'sensor_msgs/LaserScan',
            })
        );
    }, [rosConnected, ros]);

    // pointCloudListener更新時にsubscribe設定
    useEffect(() => {
        if (pointCloud === null) { return; }
        pointCloud.subscribe((msg: ROSLIB.Message) => {
            const scanMsg: LaserScan = msg as LaserScan;
            console.log('ROS operator received LaserScan msg');
            const angleMin = scanMsg.angle_min;
            const angleMax = scanMsg.angle_max;
            const angleIncrement = scanMsg.angle_increment;
            const ranges = scanMsg.ranges;
            // 各点を2D座標 (x, y) に変換
            const points = ranges.map((range, index) => {
                const angle = angleMin + index * angleIncrement;
                const x = range * Math.cos(angle);
                const y = range * Math.sin(angle);
                return { x, y }; // 各点の (x, y) 座標を配列に格納
            });
            updateLaserScan(points);
        });
    }, [pointCloud]);

    const pointCloudViewerRef = useRef<any>(null!);
    // ROS側の点群データ更新
    const updateLaserScan = (data: { x: number; y: number }[]) => {
        pointCloudViewerRef?.current?.update(data);
    };

    return (
        <>
            <Container>
                <Row>
                    <Col>
                        <PointCloudViewer ref={pointCloudViewerRef} />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default PointCloud;