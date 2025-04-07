'use client';

import { Navbar, Stack } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/app/styles/button.css';
import Link from 'next/link';
import { useROS } from '../ROSContext';

export default function AppNavbar() {
    const { rosConnected, connectToROS } = useROS();

    return (
        <Navbar className="bg-body-tertiary" expand="lg">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Stack direction="horizontal" gap={3} className="me-auto">
            <button
                className={`rosbutton ${rosConnected ? 'connected' : ''}`}
                disabled={rosConnected}
                onClick={!rosConnected ? connectToROS : undefined}
            >
                ROS接続開始
            </button>


            <h3>ROS接続状態...{rosConnected ? 'ON' : 'OFF'}</h3>
            <Link href="/viewer" className="nav-link">Viewer</Link>
            <Link href="/controller" className="nav-link">Controller</Link>
            <Link href="/pointcloud" className="nav-link">PointCloud</Link>
            <Link href="/camera" className="nav-link">Camera</Link>
            <Link href="/talker" className="nav-link">Talker</Link>
            <Link href="/test" className="nav-link">Test</Link>
            </Stack>
        </Navbar.Collapse>
        </Navbar>
    );
}