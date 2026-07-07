import { useMultiplayerState } from './useMultiplayerState';

export function useCanvasSync() {
  const syncState = useMultiplayerState();

  // In the future, this hook can handle other sync-specific logic
  // such as network status, peer connections, room coordination, etc.
  return {
    ...syncState,
  };
}
