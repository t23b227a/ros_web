'use client';

import { useROS } from './ROSContext';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const { rosConnected, connectToROS } = useROS();

  return (
    <div>
      <h1>ROS接続状態 ... {rosConnected ? 'ON' : 'OFF'}</h1>
      <Button
        variant={!rosConnected ? "primary" : "secondary"}
        disabled={rosConnected}
        onClick={!rosConnected ? connectToROS : undefined}
      >
        ROS接続開始
      </Button>
    </div>
  );
}