import { useRef } from "react";
import { Group, Rect } from "react-konva";

class MidiNote {
  pitch: number;
  startTick: number;
  durationTick: number;

  constructor(pitch: number, startTick: number, durationTick: number) {
    this.pitch = pitch;
    this.startTick = startTick;
    this.durationTick = durationTick;
  }
}

type MuiKonvaMidiNoteProps = {
  midiNote: MidiNote;
};

const MuiKonvaMidiNote = ({ midiNote }) => {
  const isDraggingHorizontally = useRef(false);

  return (
    <Group>
      <Rect
        x={midiNote.startTick}
        y={midiNote.pitch}
        width={midiNote.durationTick}
        height={10}
        fill="black"
        draggable
        onDragStart={() => {
          isDraggingHorizontally.current = true;
        }}
        onDragMove={(e) => {
          if (isDraggingHorizontally.current) {
            const newX = e.target.x();
            e.target.x(Math.max(0, Math.min(newX, 1000 - e.target.width()))); // Limit x within bounds
          } else {
            const newY = e.target.y();
            e.target.y(Math.max(0, Math.min(newY, 1270))); // Limit y within bounds
          }
        }}
        onDragEnd={() => {
          isDraggingHorizontally.current = false;
        }}
        onMouseDown={(e) => {
          const pointerPos = e.target?.getStage()?.getPointerPosition();
          if (pointerPos && Math.abs(pointerPos.y - e.target.y()) > 10) {
            isDraggingHorizontally.current = false;
          }
        }}
      />
    </Group>
  );
};
