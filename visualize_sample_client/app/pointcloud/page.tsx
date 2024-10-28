"use client";
// React
import React, { useRef, useState, useEffect } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';
import { Vector3 } from 'three';  // 受信したPointCloudをVector3に変換

const TOPIC_NAME_POINT_CLOUD = 'pointcloud';

// PointCloud2 型 (フィールド)
export interface PointField {
    name: string;
    offset: number;
    datatype: number;
    count: number;
}

// PointCloud2 型 (データ)
export interface PointCloud2 {
    height: number;
    width: number;
    fields: PointField[];
    point_step: number;
    row_step: number;
    data: string;  // base64 encoder されているので、decode して利用する
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
                messageType: 'sensor_msgs/PointCloud2',
            })
        );
    }, [rosConnected, ros]);

        // pointCloudListener更新時に subscribe 設定
        useEffect(() => {
            if (pointCloud === null) { return; }
            // NOTE: 本来はfield情報を読み込んでdataのパースを行う必要があるが、
            //       今回は1つ分の情報が (x, y, z) となっている前提で処理を行う。
            pointCloud.subscribe((msg: ROSLIB.Message) => {
                const pcMsg:PointCloud2 = msg as PointCloud2;
                const width = pcMsg.width;
                const pointStep = pcMsg.point_step;
                const decoded = atob(pcMsg.data);  // base64されているデータのデコード
                const data:number[] = decoded.split('').map(l => l.charCodeAt(0));  // uint8配列に変換
                console.log('ROS operator received PointCloud2 msg, size = ', width);
                // Vector3の配列に変換
                const vecs:Vector3[] = [];
                for (let n = 0; n < width; n++) {
                    // バイナリ情報のインデックスを取得
                    const bPos = n * pointStep +  0;
                    const xPos = n * pointStep +  4;
                    const yPos = n * pointStep +  8;
                    const zPos = n * pointStep + 12;
                    // バイナリ → 数値変換して追加
                    const x = new Float32Array(new Uint8Array(data.slice(bPos, xPos)).buffer)[0];
                    const y = new Float32Array(new Uint8Array(data.slice(xPos, yPos)).buffer)[0];
                    const z = new Float32Array(new Uint8Array(data.slice(yPos, zPos)).buffer)[0];
                    vecs.push(new Vector3(x, y, z));
                }
            });
        }, [pointCloud]);

    return (
        <></>
    );
}

export default PointCloud;