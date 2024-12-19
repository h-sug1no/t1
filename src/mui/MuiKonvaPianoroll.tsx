// Suggested code may be subject to a license. Learn more: ~LicenseLog:3303311065.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1424122781.
import type Konva from "konva";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Text } from "react-konva";

interface PianoRollProps {
  ppqn: number; // Pulses Per Quarter Note
  numOfBars: number; // 小節数
}

function getNoteName(midiNote: number): string {
  const note_names = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  return note_names[midiNote % 12] + (Math.floor(midiNote / 12) - 1);
}
function isWhiteKey(midiPitch: number): boolean {
  const note = midiPitch % 12;
  return [0, 2, 4, 5, 7, 9, 11].includes(note);
}
const PIANO_LABEL_SIZE = {
  w: 40,
};

const PianoRoll: React.FC<PianoRollProps> = ({ ppqn, numOfBars }) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const pianoLayerRef = useRef<Konva.Layer | null>(null);

  const [zoom, setZoom] = useState(1.0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 500, height: 500 });

  const minZoom = 0.5;
  const maxZoom = 2.0;
  // 1小節のtick数
  const ticksPerBar = ppqn * 4; // 1小節のtick数（4分音符の場合）

  // 小節幅（ピクセル単位）
  const barWidth = 100; // 1tickが100ピクセルに対応（適宜スケールを変更）

  const pitches = Array.from({ length: 128 }, (_, i) => i); // MIDIピッチ 0-127

  // ズーム範囲の動的な計算
  const zoomRangeMin = Math.max(
    minZoom,
    stageSize.width / (numOfBars * barWidth + PIANO_LABEL_SIZE.w),
  );
  const zoomRangeMax = Math.min(maxZoom, stageSize.width / barWidth);

  const noteHeight = 10; // 各MIDIノートの高さ
  const barHeight = 128 * noteHeight; // ピアノロールの高さ（128ピッチ分の高さ）

  // scrollXのmin,maxを動的に算出
  const scrollXMax = PIANO_LABEL_SIZE.w;
  const scrollXMin = -Math.max(
    0,
    numOfBars * barWidth * zoom - (stageSize.width - PIANO_LABEL_SIZE.w * zoom),
  );

  // scrollYのmin,maxを設定（固定値）
  const scrollYMin = -500;
  const scrollYMax = 500;

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      // スクロールとズームを設定
      stage.scale({ x: zoom, y: zoom });
      if (pianoLayerRef.current) {
        pianoLayerRef.current.x(scrollX);
      }
      stage.y(scrollY);
      stage.batchDraw();
    }
  }, [zoom, scrollX, scrollY]);

  // MIDIノートの色を偶数ピッチに基づいて変更
  const getNoteColor = (pitch: number) => (pitch % 2 === 0 ? "blue" : "green");

  // 小節境界を描画
  const renderBarLines = () => {
    const barLines: JSX.Element[] = [];
    for (let i = 0; i <= numOfBars; i++) {
      barLines.push(
        <Line
          key={`bar-${i}`}
          points={[i * barWidth, 0, i * barWidth, barHeight]} // 小節境界線
          stroke="black"
          strokeWidth={2}
        />,
      );
    }
    return barLines;
  };

  // ピッチグリッドを描画
  const renderPitchGrid = () => {
    const pitchLines: JSX.Element[] = [];
    const pitchSpacing = noteHeight; // 1ピッチ分の高さ

    for (let i = 0; i < 128; i++) {
      pitchLines.push(
        <Line
          key={`pitch-${i}`}
          points={[
            0,
            i * pitchSpacing,
            numOfBars * barWidth + 0,
            i * pitchSpacing,
          ]} // グリッド線
          stroke="gray"
          strokeWidth={1}
          dash={[5, 5]} // 点線にする
        />,
      );
    }

    return pitchLines;
  };

  // MIDIノート部分（まだ描画しない）
  const renderNotes = () => {
    return null; // 今は実装しない
  };

  const renderPianoKeysAndLabels = () => {
    const keysAndLabels: JSX.Element[] = [];
    for (let i = 127; i >= 0; i--) {
      const color = isWhiteKey(i) ? "white" : "rgb(60, 40, 20)";
      const yPos = (127 - i) * noteHeight;
      keysAndLabels.push(
        <Group key={`key-and-label-${i}`}>
          <Rect
            x={0}
            y={yPos}
            width={PIANO_LABEL_SIZE.w}
            height={noteHeight}
            fill={color}
            stroke="black"
            strokeWidth={1}
          />
          <Text
            x={0}
            y={yPos + 2}
            text={`${i}:${getNoteName(i)}`}
            fontSize={8}
            fill={isWhiteKey(i) ? "black" : "#ddd"}
            width={PIANO_LABEL_SIZE.w}
            align="center"
          />
        </Group>,
      );
    }
    return keysAndLabels;
  };

  const handleResize = useCallback(() => {
    const container = document.querySelector(
      ".stage-container",
    ) as HTMLDivElement;
    if (container) {
      setStageSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);
  return (
    <div>
      <div>
        {/* ズームとスクロールUI */}
        <label>
          Zoom:
          <input
            type="range"
            min={zoomRangeMin}
            max={zoomRangeMax}
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
          />
        </label>
        <label>
          Scroll X:
          <input
            type="range" // range sliderのまま
            min={scrollXMin}
            max={scrollXMax}
            step="10"
            value={scrollX}
            onChange={(e) => setScrollX(Number.parseInt(e.target.value))}
          />
        </label>
        <label>
          Scroll Y:
          <input
            type="range"
            min={scrollYMin}
            max={scrollYMax}
            step="10"
            value={scrollY}
            onChange={(e) => setScrollY(Number.parseInt(e.target.value))}
          />
        </label>
      </div>

      <div
        className="stage-container"
        style={{
          width: "80vw",
          height: "500px",
          backgroundColor: "#ddd",
          overflow: "hidden",
          border: "solid black 1px",
          margin: "auto",
          marginTop: "2em",
        }}
      >
        <Stage ref={stageRef} width={stageSize.width} height={stageSize.height}>
          <Layer ref={pianoLayerRef}>
            {renderPitchGrid()}
            {renderBarLines()}
            {renderNotes()}
          </Layer>
          <Layer x={0}>{renderPianoKeysAndLabels()}</Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PianoRoll;
