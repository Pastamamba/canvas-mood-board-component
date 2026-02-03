export interface DrawingHistoryManager {
  states: ImageData[];
  currentIndex: number;
  maxStates: number;
}

export const createHistoryManager = (maxStates: number = 50): DrawingHistoryManager => ({
  states: [],
  currentIndex: -1,
  maxStates
});

export const saveDrawingState = (
  canvas: HTMLCanvasElement,
  history: DrawingHistoryManager
): DrawingHistoryManager => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return history;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newStates = history.states.slice(0, history.currentIndex + 1);
  newStates.push(imageData);

  // Limit history size
  if (newStates.length > history.maxStates) {
    newStates.shift();
  }

  return {
    ...history,
    states: newStates,
    currentIndex: newStates.length - 1
  };
};

export const undoDrawing = (
  canvas: HTMLCanvasElement,
  history: DrawingHistoryManager
): DrawingHistoryManager => {
  if (history.currentIndex > 0) {
    const newIndex = history.currentIndex - 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(history.states[newIndex], 0, 0);
    }
    return {
      ...history,
      currentIndex: newIndex
    };
  }
  return history;
};

export const redoDrawing = (
  canvas: HTMLCanvasElement,
  history: DrawingHistoryManager
): DrawingHistoryManager => {
  if (history.currentIndex < history.states.length - 1) {
    const newIndex = history.currentIndex + 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(history.states[newIndex], 0, 0);
    }
    return {
      ...history,
      currentIndex: newIndex
    };
  }
  return history;
};

export type DrawingTool = 'pen' | 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text';

export interface DrawingState {
  tool: DrawingTool;
  color: string;
  size: number;
  opacity: number;
  fill: boolean;
  fontSize: number;
}

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  tool: DrawingTool,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  state: DrawingState
) => {
  ctx.globalAlpha = state.opacity;
  ctx.strokeStyle = state.color;
  ctx.fillStyle = state.color;
  ctx.lineWidth = state.size;

  switch (tool) {
    case 'line':
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;

    case 'rectangle': {
      const width = endX - startX;
      const height = endY - startY;
      if (state.fill) {
        ctx.fillRect(startX, startY, width, height);
      } else {
        ctx.strokeRect(startX, startY, width, height);
      }
      break;
    }

    case 'circle': {
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      if (state.fill) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
      break;
    }

    case 'text':
      ctx.font = `${state.fontSize}px Arial`;
      ctx.fillText('Click to edit text', startX, startY);
      break;
  }

  ctx.globalAlpha = 1; // Reset opacity
};