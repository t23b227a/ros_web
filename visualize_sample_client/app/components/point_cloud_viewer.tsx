"use client";
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// Three.js
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'; // カメラ処理
import { Point, Points } from '@react-three/drei'; // Particle


//////////////////////////////////////////////////
/// Settings                                   ///
//////////////////////////////////////////////////

// 背景色
const BACKGROUND_COLOR = '#050505';

// 表示パーティクル最大値
// NOTE: これより大きい点群が入ってきた場合はそれ以上を読み込まない。
const PARTICLES_MAX = 25000;

// パーティクル (1つ分の) サイズ
const PARTICLE_SIZE = 0.12;

// パーティクルの色
const PARTICLE_COLOR = '#B3A675';


//////////////////////////////////////////////////
/// Particles                                  ///
//////////////////////////////////////////////////

// Viewerの点群表示部
const ParticlesViewer = forwardRef((props, ref) => {
    // 上位モジュールから呼び出される処理
    useImperativeHandle(ref, () => ({
        // 点群更新
        update: (newPoints: { x: number; y: number }[]) => {
            setPoints(newPoints.slice(0, PARTICLES_MAX)); // 最大値までに制限をかける
        },
    }));

    // 描画グループに対するref
    const gRef = useRef<THREE.Group>(null!);

    // 点群
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

    // 表示
    return (
        <>
            <group>
                {/* 点群 */}
                <group ref={gRef}>
                    <Points limit={PARTICLES_MAX}>
                        <pointsMaterial vertexColors size={PARTICLE_SIZE} />
                        {points.map((p, i) => (
                            <Point key={i}
                                position={[p.x, p.y, 0]}    // zを0に固定(2D 表示)
                                color={PARTICLE_COLOR} />
                        ))}
                    </Points>
                </group>
            </group>
        </>
    );
});


//////////////////////////////////////////////////
/// Point cloud viewer                         ///
//////////////////////////////////////////////////

const PointCloudViewer = forwardRef((props, ref) => {
    // 上位モジュールから呼び出される処理
    useImperativeHandle(ref, () => ({
        // 点群更新
        update: (newPoints: { x: number; y: number }[]) => {
            particlesRef.current.update(newPoints); // 点群表示モジュールにそのまま投げる
        },
    }));


    // 点群表示モジュールへのref
    const particlesRef = useRef<any>(null!);

    // 表示
    return (
        <>
            <Canvas style={{width: "99%", height: "90vh"}}>
                {/* 背景色 */}
                <color attach="background" args={[BACKGROUND_COLOR]} />

                {/* 環境光 */}
                <ambientLight />

                {/* OrbitControls ... カメラ操作 */}
                <OrbitControls target-z={1} />

                {/* 表示確認用の軸表示 */}
                <axesHelper args={[6]} />

                {/* 点群表示 */}
                <ParticlesViewer ref={particlesRef} />
            </Canvas>
        </>
    );
});

// Export settings
PointCloudViewer.displayName = 'PointCloudViewer';
export default PointCloudViewer;