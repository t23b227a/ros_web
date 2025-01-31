"use client";
// React
import React, { useState, useRef, useEffect, useCallback } from 'react';

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
        if (!baseRef.current || !stickRef.current) return;
        let clientX, clientY;
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
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
                const e_touches = (e as React.TouchEvent).changedTouches;
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
                width: '17vw', // Relative size
                height: '17vw', // Keep aspect ratio
                backgroundColor: '#ccc',
                borderRadius: '50%',
            }}
        >
            <div
                ref={stickRef}
                style={{
                    position: 'absolute',
                    width: '45px', // Optional max size
                    height: '45px',
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

export default Stick;