'use client'
import Viewer from '../lib/viewer';
import Talker from '@/lib/sender';
import JoystickController from '@/lib/controller';
import { useState } from 'react';

export default function Home() {
  const [isViewer, setViewer] = useState(true);
  const [isSender, setSender] = useState(false);
  const [isController, setController] = useState(false);
  return (
    <div>
      {isViewer && (
        <Viewer />
      )}
      {isSender && (
        <Talker />
      )}
      {isController && (
        <JoystickController />
      )}
    </div>
  );
}
