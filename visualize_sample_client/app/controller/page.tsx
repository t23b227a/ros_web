"use client";
import React, { useState, useRef, useEffect } from 'react';

interface JoystickState {
    angle: number;      // [0 ~ 360](単位円)
    strength: number;   // [0 ~ 1]
}

interface StickProps {
    onChange: (state: JoystickState) => void;
    id: string;
}

const Stick: React.FC<StickProps> = ({ onChange, id }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const touchIdRef = useRef<number | null>(null);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isActive || !baseRef.current || !stickRef.current) return;
            let clientX, clientY;
            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
                if (!touch) return;
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            const baseRect = baseRef.current.getBoundingClientRect();
            const maxDistance = baseRect.width / 2 - stickRef.current.offsetWidth / 2;
            let x = clientX - baseRect.left - baseRect.width / 2;
            let y = clientY - baseRect.top - baseRect.height / 2;
            const distance = Math.sqrt(x*x + y*y);
            const strength = Math.min(distance / maxDistance, 1);
            if (distance > maxDistance) {
                x *= maxDistance / distance;
                y *= maxDistance / distance;
            }
            // 角度の計算（ラジアンからデグリーに変換）
            const angle = (Math.atan2(-y, x) * 180 / Math.PI + 360) % 360;
            setPosition({ x, y });
            onChange({ angle, strength });
        };
        const handleEnd = () => {
            setIsActive(false);
            setPosition({ x: 0, y: 0 });
            onChange({ angle: 0, strength: 0 });
            touchIdRef.current = null;
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (isActive) return;
            const touch = e.touches[0];
            touchIdRef.current = touch.identifier;
            setIsActive(true);
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
            if (touch) {
                handleEnd();
            }
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend',  handleTouchEnd);

        const baseElement = baseRef.current;
        if (baseElement) {
            baseElement.addEventListener('touchstart', handleTouchStart);
        }

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            if (baseElement) {
                baseElement.removeEventListener('touchstart', handleTouchStart);
            }
        };
    }, [isActive, onChange]);

    const handleMouseDown = () => {
        setIsActive(true);
    };

    return (
        <>
            <div
                ref={baseRef}
                style={{
                    position: 'relative',
                    width: '200px',
                    height: '200px',
                    backgroundColor: '#ccc',
                    borderRadius: '50%',
                }}
                onMouseDown={handleMouseDown}
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
        </>
    );
};

const JoystickController: React.FC = () => {
    const [leftStick, setLeftStick] = useState<JoystickState>({ angle: 0, strength: 0 });
    const [rightStick, setRightStick] = useState<JoystickState>({ angle: 0, strength: 0 });

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100vh' }}>
            <div>
                <h3>左スティック</h3>
                <Stick onChange={setLeftStick} id="left" />
                <p>角度: {leftStick.angle.toFixed(2)}°</p>
                <p>強度: {(leftStick.strength * 100).toFixed(2)}%</p>
            </div>
            <div>
                <h3>右スティック</h3>
                <Stick onChange={setRightStick} id="right" />
                <p>角度: {rightStick.angle.toFixed(2)}°</p>
                <p>強度: {(rightStick.strength * 100).toFixed(2)}%</p>
            </div>
        </div>
    );
};

export default JoystickController;