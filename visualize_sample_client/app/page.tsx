'use client'
import Viewer from '@/app/components/viewer';
import Talker from '@/app/components/sender';
import JoystickController from '@/app/components/controller';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import { Button, Stack } from 'react-bootstrap';

// ROS接続URL
const ROS_CONNECTION_URL = 'ws://127.0.0.1:9090';

export interface ChildComponentProps {
  ros: ROSLIB.Ros | null;
  rosConnected: boolean;
}

export default function Home() {
  const [ros, setRosObject] = useState<ROSLIB.Ros | null>(null);
  const [rosConnected, setRosConnected] = useState(false);
  const connectToROS = () => {
    console.log('ROS Operator: Try connection...');
    setRosConnected(false);
    setRosObject(new ROSLIB.Ros({url:ROS_CONNECTION_URL}));
  };
  useEffect(() => {
    // 初回表示時は ROS オブジェクトが null なのでスキップ
    if (ros === null) { return; }
    // 接続完了検知 or エラー検知
    ros.on('connection', () => {
        console.log('ROS Operator: ROS connected.');
        setRosConnected?.(true);
    });
    ros.on('error', (err) => {
        console.log('ROS Operator: ROS connection error, ', err);
        setRosConnected?.(false);
    });
    ros.on('close', () => {
        console.log('ROS Operator: ROS connection closed.');
        setRosConnected?.(false);
    });
    return () => {
      ros.close();
    };
  }, [ros]);

  return (
    <div>
      <Router>
        <Navbar className="bg-body-tertiary">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Stack direction="horizontal" gap={3}>
              <h2>ROS接続状態 ... {rosConnected ? 'ON' : 'OFF'}</h2>
              <Button
                  variant={!rosConnected ? "primary" : "secondary"}
                  disabled={rosConnected}
                  onClick={!rosConnected ? connectToROS : undefined}
              >
                  ROS接続開始
              </Button>
                  <Link to="/">ホーム</Link>
                  <Link to="/viewer">Viewer</Link>
                  <Link to="/talker">Talker</Link>
                  <Link to="/controller">Controller</Link>
            </Stack>
            </Navbar.Collapse>
        </Navbar>
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/viewer" element={<Viewer ros={ros} rosConnected={rosConnected} />} />
            <Route path="/talker" element={<Talker ros={ros} rosConnected={rosConnected} />} />
            <Route path="/controller" element={<JoystickController ros={ros} rosConnected={rosConnected} />} />
          </Routes>
      </Router>
    </div>
  );
}
