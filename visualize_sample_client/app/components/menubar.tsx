'use client';

import { Navbar, Stack, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import { useROS } from '../ROSContext';

export default function AppNavbar() {
    const { rosConnected, connectToROS } = useROS();

    return (
        <Navbar className="bg-body-tertiary" expand="lg">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Stack direction="horizontal" gap={3} className="me-auto">
            <Button
                variant={!rosConnected ? "primary" : "outline-secondary"}
                disabled={rosConnected}
                onClick={!rosConnected ? connectToROS : undefined}
            >
                ROS接続開始
            </Button>
            <h3>ROS接続状態...{rosConnected ? 'ON' : 'OFF'}</h3>
            <Link href="/" className="nav-link">ホーム</Link>
            <Link href="/viewer" className="nav-link">Viewer</Link>
            <Link href="/talker" className="nav-link">Talker</Link>
            <Link href="/controller" className="nav-link">Controller</Link>
            </Stack>
        </Navbar.Collapse>
        </Navbar>
    );
}