"use client";
// React
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ROS
import ROSLIB from 'roslib';
import { useROS } from '@/app/ROSContext';

const MAX_SPEED = 1.0;
const TOPIC_NAME = 'R1/cmd_vel';

interface StickState {
    x: number;   // [0 ~ 1]
    y: number;   // [0 ~ 1]
}

interface StickProps {
    onChange: (state: StickState) => void;
    id: string;
}

const Stick: React.FC<StickProps> = ({ onChange, id }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const touchIdRef = useRef<number | null>(null);

    const touchMove = useCallback((e: TouchEvent) => {
        e.preventDefault();
        if(!Array.from(e.changedTouches).some(t => t.identifier === touchIdRef.current)) return;
        if (!baseRef.current || !stickRef.current) return;
        let clientX, clientY;
        const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
        const baseRect = baseRef.current.getBoundingClientRect();
        const maxDistance = baseRect.width / 2 - stickRef.current.offsetWidth / 2;
        let x = clientX - baseRect.left - baseRect.width / 2;
        let y = clientY - baseRect.top - baseRect.height / 2;
        const distance = Math.sqrt(x*x + y*y);
        if (distance > maxDistance) {
            x *= maxDistance / distance;
            y *= maxDistance / distance;
        }
        setPosition({ x, y });
        onChange({ x: x/maxDistance, y: -y/maxDistance });
    }, [onChange]);

    const mouseMove = useCallback((e: MouseEvent) => {
        if (!baseRef.current || !stickRef.current) return;
        let clientX, clientY;
        clientX = e.clientX;
        clientY = e.clientY;
        const baseRect = baseRef.current.getBoundingClientRect();
        const maxDistance = baseRect.width / 2 - stickRef.current.offsetWidth / 2;
        let x = clientX - baseRect.left - baseRect.width / 2;
        let y = clientY - baseRect.top - baseRect.height / 2;
        const distance = Math.sqrt(x*x + y*y);
        if (distance > maxDistance) {
            x *= maxDistance / distance;
            y *= maxDistance / distance;
        }
        setPosition({ x, y });
        onChange({ x: x/maxDistance, y: -y/maxDistance });
    }, [onChange]);

    const touchEnd = useCallback((e: TouchEvent) => {
        if(touchIdRef.current === e.changedTouches[0].identifier) {
            setIsActive(false);
            setPosition({ x: 0, y: 0 });
            onChange({ x: 0, y: 0 });
            touchIdRef.current = null;
        }
    }, [onChange]);

    const mouseEnd = useCallback((e: MouseEvent) => {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
        onChange({ x: 0, y: 0 });
        touchIdRef.current = null;
    }, [onChange]);

    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (isActive) return;
        const target = e.target as Node;
        if (baseRef.current && baseRef.current.contains(target)) {
            setIsActive(true);
            if (e.type === 'touchstart') {
                const e_touches = (e as React.TouchEvent).touches;
                const touch = e_touches[e_touches.length - 1];
                touchIdRef.current = touch.identifier;
            }
        }
    }, [touchMove]);

    useEffect(() => {
        if (isActive) {
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseEnd);
        } else {
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseEnd);
        }
    }, [isActive, mouseMove,mouseEnd]);

    useEffect(() => {
        if (isActive) {
            document.addEventListener('touchmove', touchMove, { passive: false });
            document.addEventListener('touchend', touchEnd);
            document.addEventListener('touchcancel', touchEnd);
        } else {
            document.removeEventListener('touchmove', touchMove);
            document.removeEventListener('touchend', touchEnd);
            document.removeEventListener('touchcancel', touchEnd);
        }
    }, [isActive, touchMove, touchEnd]);

    return (
        <div
            ref={baseRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            style={{
                position: 'relative',
                width: '30vw', // Relative size
                height: '30vw', // Keep aspect ratio
                maxWidth: '200px', // Optional max size
                maxHeight: '200px',
                backgroundColor: '#ccc',
                borderRadius: '50%',
            }}
        >
            <div
                ref={stickRef}
                style={{
                    position: 'absolute',
                    width: '10vw', // Relative size
                    height: '10vw',
                    maxWidth: '50px', // Optional max size
                    maxHeight: '50px',
                    backgroundColor: '#333',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                }}
            />
        </div>
    );
};

const JoystickController: React.FC = () => {
    const { ros, rosConnected } = useROS();
    const [leftStick, setLeftStick] = useState<StickState>({ x: 0, y: 0 });
    const [rightStick, setRightStick] = useState<StickState>({ x: 0, y: 0 });
    const [buttons, setButtons] = useState<number[]>([0, 0]);
    const [talker, setTalker] = useState<ROSLIB.Topic | null>(null);

    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setTalker(
            new ROSLIB.Topic({
                ros: ros,
                name: TOPIC_NAME,
                messageType: 'geometry_msgs/TwistStamped',
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
                linear: { x: leftStick.x * MAX_SPEED, y: leftStick.y * MAX_SPEED, z: 0.0 },
                angular: { x: 0.0, y: 0.0, z: rightStick.x },
            },
        });
        talker?.publish(message);
        // console.log('Controller message published: ', message);
    }, [leftStick, rightStick, buttons]);
    //新たなボタン用のコンポーネントを作成し、その引数として直接setButtonsを渡す

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '90vh' }}>
            <div>
                <h3>左スティック</h3>
                <Stick onChange={setLeftStick} id="left" />
                <p>x: {(leftStick.x * MAX_SPEED).toFixed(5)}</p>
                <p>y: {(leftStick.y * MAX_SPEED).toFixed(5)}</p>
            </div>
            <div>
                <h3>右スティック</h3>
                <Stick onChange={setRightStick} id="right" />
                <p>x: {rightStick.x.toFixed(5)}</p>
                <p>y: {rightStick.y.toFixed(5)}</p>
            </div>
        </div>
    );
};

export default JoystickController;