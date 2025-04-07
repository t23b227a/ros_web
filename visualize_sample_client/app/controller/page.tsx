"use client";
// React
import React, { useState, useEffect, } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

// MyComponents
import Stick from '@/app/components/stick';
import ImageManipulation from '@/app/components/image_manipulate';
import MyButton from '@/app/components/button';
import Toggle from '@/app/components/toggle';

const MAX_SPEED = 1.0;
const MAX_ANGULARSPEED = 1.5;
const TOPIC_NAME = 'R1/cmd_vel';

interface StickState {
    x: number;   // [0 ~ 1]
    y: number;   // [0 ~ 1]
}

const Controller: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [leftStick, setLeftStick] = useState<StickState>({ x: 0, y: 0 });
    const [rightStick, setRightStick] = useState<StickState>({ x: 0, y: 0 });
    const [speedpub, setSpeedpub] = useState<ROSLIB.Topic | null>(null);
    const [lowspeed, setLowspeed] = useState(false);
    const [worldScale, setWorldscale] = useState(false);
    const [scalepub, setScalepub] = useState<ROSLIB.Topic | null>(null);

    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setSpeedpub(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME,
                messageType: 'geometry_msgs/TwistStamped',
            })
        );
        setScalepub(
            new ROSLIB.Topic({
                ros: ros,
                name: 'world_scale',
                messageType: 'std_msgs/Bool',
            })
        );
    }, [rosConnected, ros]);

    useEffect(() => {
        if (!rosConnected) return;
        const message = new ROSLIB.Message({
            header: {
                stamp: {
                    secs: Math.floor(Date.now() / 1000),
                    nsecs: (Date.now() % 1000) * 1000000,
                },
                frame_id: '',
            },
            twist: {
                linear: { x: leftStick.x * MAX_SPEED * (lowspeed ? 0.5 : 1.0), y: leftStick.y * MAX_SPEED * (lowspeed ? 0.5 : 1.0), z: 0.0 },
                angular: { x: 0.0, y: 0.0, z: rightStick.x * MAX_ANGULARSPEED },
            },
        });
        speedpub?.publish(message);
        // console.log('Controller message published: ', message);
    }, [leftStick, rightStick]);

    useEffect(() => {
        if (!rosConnected) return;
        const message = new ROSLIB.Message({
            data: worldScale
        });
        scalepub?.publish(message);
        // console.log('Scale message published: ', message);
    }, [worldScale]);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', height: '90vh' }}>
            <div style={{ height: '85%', position: 'relative', width: '17vw', }}>
                <Toggle name='ワールド座標' setState={setWorldscale} />
                <Toggle name='低速' setState={setLowspeed} />
                <div style={{ position: 'absolute', bottom: '20%' }}>
                    <p style={{ display:'flex', justifyContent: 'center',margin: '0 auto' }}>
                        x: {(leftStick.x * MAX_SPEED).toFixed(5)} <br />
                        y: {(leftStick.y * MAX_SPEED).toFixed(5)}
                    </p>
                    <Stick onChange={setLeftStick} id="left" />
                </div>
            </div>
            <ImageManipulation />
            <div style={{ height: '85%', position: 'relative', width: '17vw', }}>
                <div style={{ marginBottom: '45px' }}>
                    <MyButton state="5">
                        シュート
                    </MyButton>
                    <MyButton state="6">
                        パス
                    </MyButton>
                </div>
                <div style={{ position: 'absolute', bottom: '20%' }}>
                    <p style={{ display:'flex', justifyContent: 'center',margin: '0 auto' }}>
                        x: {rightStick.x.toFixed(5)} <br />
                        y: {rightStick.y.toFixed(5)} <br />
                    </p>
                    <Stick onChange={setRightStick} id="right" />
                </div>
            </div>
        </div>
    );
};

export default Controller;