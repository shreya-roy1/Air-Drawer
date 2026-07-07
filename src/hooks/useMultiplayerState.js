import { useState, useCallback, useRef } from 'react';

const FILTER_SIZE = 5;

export function useMultiplayerState() {
  const [strokes, setStrokes] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [redoStack, setRedoStack] = useState([]);

  // Track raw coordinates for moving average filtering on the active stroke
  const rawPointsHistory = useRef([]);
  const nextId = useRef(1);

  // Starts a new drawing path
  const startStroke = useCallback((color, lineWidth, glowIntensity) => {
    rawPointsHistory.current = [];
    setCurrentPath({
      points: [],
      color,
      lineWidth,
      glowIntensity,
    });
  }, []);

  // Adds a point, applying the lightweight moving average filter
  const addPoint = useCallback((rawPoint) => {
    rawPointsHistory.current.push(rawPoint);
    if (rawPointsHistory.current.length > FILTER_SIZE) {
      rawPointsHistory.current.shift();
    }

    const len = rawPointsHistory.current.length;
    let sumX = 0, sumY = 0, sumZ = 0;
    for (let i = 0; i < len; i++) {
      sumX += rawPointsHistory.current[i].x;
      sumY += rawPointsHistory.current[i].y;
      sumZ += rawPointsHistory.current[i].z !== undefined ? rawPointsHistory.current[i].z : 0;
    }

    const smoothedPoint = {
      x: sumX / len,
      y: sumY / len,
      z: sumZ / len,
    };

    setCurrentPath(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, smoothedPoint],
      };
    });
  }, []);

  // Commits the active stroke to the final array of strokes
  const endStroke = useCallback(() => {
    setCurrentPath(prev => {
      if (prev && prev.points.length > 0) {
        const strokeId = nextId.current++;
        const newStroke = {
          id: strokeId,
          ...prev,
          transform: { tx: 0, ty: 0, scale: 1, rotation: 0 },
        };

        setStrokes(prevStrokes => [...prevStrokes, newStroke]);
        setRedoStack([]); // Clear redo stack on new stroke

        // --- REAL-TIME MULTIPLAYER SYNC PREP ---
        // At this point, we would push the committed stroke data to the backend via tRPC:
        // trpc.addStroke.mutate({ id: strokeId, points: newStroke.points, color: newStroke.color, ... });
      }
      return null;
    });
    rawPointsHistory.current = [];
  }, []);

  const removeStroke = useCallback((id) => {
    setStrokes(prev => prev.filter(s => s.id !== id));

    // --- REAL-TIME MULTIPLAYER SYNC PREP ---
    // trpc.removeStroke.mutate({ id });
  }, []);

  const updateStrokeTransform = useCallback((id, transformUpdate) => {
    setStrokes(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          transform: {
            ...s.transform,
            ...transformUpdate,
          },
        };
      }
      return s;
    }));
  }, []);

  const undo = useCallback(() => {
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack(redo => [...redo, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStrokes(strokes => [...strokes, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => {
    setStrokes([]);
    setRedoStack([]);
    setCurrentPath(null);
    rawPointsHistory.current = [];
  }, []);

  // --- PLACEHOLDER FOR TRPC/WEBSOCKET MULTIPLAYER SUBSCRIPTION ---
  // This method would be triggered by WebSocket subscriptions when another user draws:
  const handleIncomingStroke = useCallback((remoteStroke) => {
    // If the remote stroke doesn't have an ID, assign one
    const strokeWithId = {
      ...remoteStroke,
      id: remoteStroke.id || `remote-${Date.now()}-${Math.random()}`,
      transform: remoteStroke.transform || { tx: 0, ty: 0, scale: 1, rotation: 0 }
    };
    setStrokes(prev => {
      if (prev.some(s => s.id === strokeWithId.id)) return prev; // avoid duplicates
      return [...prev, strokeWithId];
    });
  }, []);

  return {
    strokes,
    currentPath,
    startStroke,
    addPoint,
    endStroke,
    removeStroke,
    updateStrokeTransform,
    undo,
    redo,
    clear,
    handleIncomingStroke,
  };
}
