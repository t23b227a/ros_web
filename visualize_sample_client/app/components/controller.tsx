"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChildComponentProps } from '@/app/page';
import ROSLIB from 'roslib';

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

    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!baseRef.current || !stickRef.current) return;
        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
            if (!touch) return;
            clientX = touch.clientX;
            clientY = touch.clientY;
        }
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

    const handleEnd = useCallback(() => {
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
                const touch = (e as React.TouchEvent).touches[0];
                touchIdRef.current = touch.identifier;
            }
        }
    }, [handleMove]);

    useEffect(() => {
        if (isActive) {
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);
            document.addEventListener('touchcancel', handleEnd);
        } else {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('touchcancel', handleEnd);
        }
    }, [isActive, handleMove, handleEnd]);

    return (
        <div
            ref={baseRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                backgroundColor: '#ccc',
                borderRadius: '50%',
            }}
        >
            <div
                ref={stickRef}
                style={{
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
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

const JoystickController: React.FC<ChildComponentProps> = ({ ros, rosConnected }) => {
    const [leftStick, setLeftStick] = useState<StickState>({ x: 0, y: 0 });
    const [rightStick, setRightStick] = useState<StickState>({ x: 0, y: 0 });
    const [buttons, setButtons] = useState<number[]>([0, 0]);
    const [talker, setTalker] = useState<ROSLIB.Topic | null>(null);

    useEffect(() => {
        if (ros == null || !rosConnected) return;
        setTalker(
            new ROSLIB.Topic({
                ros: ros,
                name: 'controller',
                messageType: 'sensor_msgs/msg/Joy',
            })
        );
    }, [ros]);

    useEffect(() => {
        const axes = [leftStick.x, leftStick.y, rightStick.x, rightStick.y];
        if (!rosConnected) return;
        const message = new ROSLIB.Message({
            header: {
                stamp: {
                    secs: Math.floor(Date.now() / 1000),
                    nsecs: (Date.now() % 1000) * 1000000,
                },
                frame_id: '',
            },
            axes: axes,
            buttons: buttons,
        });
        talker?.publish(message);
        console.log('axes:',axes)
        console.log('Controller message published: ', message);
    }, [leftStick, rightStick, buttons]);
    //新たなボタン用のコンポーネントを作成し、その引数として直接setButtonsを渡す

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100vh' }}>
            <div>
                <h3>左スティック</h3>
                <Stick onChange={setLeftStick} id="left" />
                <p>x: {leftStick.x.toFixed(5)}</p>
                <p>y: {leftStick.y.toFixed(5)}</p>
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