'use client';
// ROS
import { useROS } from './ROSContext';

import Viewer from './viewer/page';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const { rosConnected, connectToROS } = useROS();

  return (
    <div>
      <Viewer />
    </div>
  );
}