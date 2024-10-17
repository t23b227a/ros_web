'use client'
import MenuBar from '@/lib/Menubar';
import Viewer from '@/lib/viewer';
import Talker from '@/lib/sender';
import JoystickController from '@/lib/controller';
import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import { Button, Stack } from 'react-bootstrap';

// ROS接続URL
const ROS_CONNECTION_URL = 'ws://127.0.0.1:9090';

export interface ChildComponentProps {
  ros: ROSLIB.Ros;
}

export default function Home() {
  const [isViewer, setViewer] = useState(true);
  const [isSender, setSender] = useState(false);
  const [isController, setController] = useState(false);
  const [ros, setRosObject] = useState<ROSLIB.Ros | null>(null);
  const [rosConnected, setRosConnected] = useState(false);
  const connectToROS = () => {
    console.log('ROS Operator: Try connection...');
    setRosObject(new ROSLIB.Ros({url:ROS_CONNECTION_URL}));
  };
  useEffect(() => {
    // 初回表示時は ROS オブジェクトが null なのでスキップ
    if (ros === null) { return; }
    // 接続完了検知 or エラー検知
    // NOTE: 検知時に上位モジュールにフラグ通知
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
  }, [ros]);

  return (
    <div>
      <Stack direction="horizontal" gap={3}>
        <MenuBar />
          <Button
              variant={!rosConnected ? "primary" : "secondary"}
              disabled={rosConnected}
              onClick={!rosConnected ? connectToROS : undefined}
          >
              ROS接続開始
          </Button>
          <h3>ROS接続状態 ... {rosConnected ? 'ON' : 'OFF'}</h3>
      </Stack>
      {ros && isViewer && (
        <Viewer ros={ros} />
      )}
      {ros && isSender && (
        <Talker ros={ros} />
      )}
      {ros && isController && (
        <JoystickController />
      )}
    </div>
  );
}
