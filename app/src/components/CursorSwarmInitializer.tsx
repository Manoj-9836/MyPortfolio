import { useEffect } from 'react';
import { initializeCursorSwarm } from '../lib/cursorSwarm';

export default function CursorSwarmInitializer() {
  useEffect(initializeCursorSwarm, []);
  return null;
}
