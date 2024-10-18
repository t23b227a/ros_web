'use client'
import MenuBar from '@/lib/menubar';
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
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('Home');
  const [isViewer, setViewer] = useState(true);
  const [isSender, setSender] = useState(false);
  const [isController, setController] = useState(false);
  const [ros, setRosObject] = useState<ROSLIB.Ros | null>(null);
  const [rosConnected, setRosConnected] = useState(false);
  const handleMenuItemSelect = (item: string) => {
    setSelectedMenuItem(item);
  };
  useEffect(() => {
    setViewer(false);
    setSender(false);
    setController(false);
    if(selectedMenuItem === 'Viewer'){
      setViewer(true);
    } else if (selectedMenuItem === 'Talker') {
      setSender(true);
    } else if (selectedMenuItem === 'Controller') {
      setController(true);
    }
  }, [selectedMenuItem])
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
  }, [ros]);

  return (
    <div>
      <Stack direction="horizontal" gap={3}>
        <h2>ROS接続状態 ... {rosConnected ? 'ON' : 'OFF'}</h2>
        <Button
            variant={!rosConnected ? "primary" : "secondary"}
            disabled={rosConnected}
            onClick={!rosConnected ? connectToROS : undefined}
        >
            ROS接続開始
        </Button>
        <MenuBar onSelectMenuItem={handleMenuItemSelect} />
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
