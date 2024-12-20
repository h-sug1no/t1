// Suggested code may be subject to a license. Learn more: ~LicenseLog:3303311065.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1424122781.
import type Konva from "konva";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Text } from "react-konva";

interface PianoRollProps {
  ppqn: number; // Pulses Per Quarter Note
  numOfBars: number; // 小節数
  timeSig?: {
    beats: number; // 1小節の拍数
    beatType: number; // 拍子の種類 (4: 4分音符, 2: 2分音符, etc.)
  };
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
const LEFT_PANEL_SIZE = {
  w: 50,
};

const TOP_PANEL_SIZE = {
  h: 50,
};

const PianoRoll: React.FC<PianoRollProps> = ({
  ppqn,
  numOfBars,
  timeSig = { beats: 4, beatType: 4 },
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const contentGroupRef = useRef<Konva.Layer | null>(null);
  const topPanelGroupRef = useRef<Konva.Layer | null>(null);
  const leftPanelGroupRef = useRef<Konva.Layer | null>(null);

  const [zoom, setZoom] = useState(1.0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 500, height: 500 });

  const vp = {
    width: stageSize.width - LEFT_PANEL_SIZE.w,
    height: stageSize.height - TOP_PANEL_SIZE.h,
  };
  const minZoom = 0.0;
  const maxZoom = 1;
  // 1小節のtick数
  const ticksPerBar = ppqn * timeSig.beats * (4 / timeSig.beatType);

  // 1拍あたりのピクセル数
  const pixelsPerBeat = ticksPerBar;
  const barWidth = pixelsPerBeat * timeSig.beats;
  const pitches = Array.from({ length: 128 }, (_, i) => i); // MIDIピッチ 0-127

  // ズーム範囲の動的な計算
  const zoomRangeMin = Math.max(minZoom, vp.width / (numOfBars * barWidth));
  const zoomRangeMax = Math.min(maxZoom, vp.width / barWidth);

  const noteHeight = pixelsPerBeat / 4; // 各MIDIノートの高さ
  const barHeight = 128 * noteHeight; // ピアノロールの高さ（128ピッチ分の高さ）

  // scrollXのmin,maxを動的に算出
  const scrollXMin = -(barWidth * numOfBars) + vp.width / zoom;
  const scrollXMax = 0;

  // scrollYのmin,maxを動的に算出
  const scrollYMin = Math.min(0, -(barHeight - vp.height / zoom));
  const scrollYMax = 0;

  useEffect(() => {
    setZoom(Math.max(zoomRangeMin, Math.min(zoomRangeMax, zoom)));
  }, [zoom, zoomRangeMin, zoomRangeMax]);

  useEffect(() => {
    setScrollX(Math.max(scrollXMin, Math.min(scrollXMax, scrollX)));
  }, [scrollX, scrollXMin]);

  useEffect(() => {
    setScrollY(Math.max(scrollYMin, Math.min(scrollYMax, scrollY)));
  }, [scrollY, scrollYMin, scrollYMax]);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      // スクロールとズームを設定
      stage.scale({ x: zoom, y: zoom });
      contentGroupRef.current?.x(scrollX);
      topPanelGroupRef.current?.x(scrollX);
      leftPanelGroupRef.current?.y(scrollY);
      contentGroupRef.current?.y(scrollY);
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
          strokeWidth={2 / zoom}
        />,
      );
    }
    return barLines;
  };

  const renderBarHeaders = () => {
    const barHeaders: JSX.Element[] = [];
    for (let i = 0; i <= numOfBars; i++) {
      barHeaders.push(
        <Group key={`barHeader-${i}`}>
          <Rect
            x={i * barWidth}
            width={barWidth}
            height={TOP_PANEL_SIZE.h / zoom}
            stroke="black"
            strokeWidth={2 / zoom}
            fill={"rgba(0,0,0,0.1)"}
          />
          <Text
            x={i * barWidth}
            y={0}
            text={`${i + 1}`}
            fontSize={12 / zoom}
            fill={"black"}
            width={barWidth}
            align="left"
            height={TOP_PANEL_SIZE.h / zoom}
            verticalAlign="top"
          />
        </Group>,
      );
    }

    return barHeaders;
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
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]} // 点線にする
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
            width={LEFT_PANEL_SIZE.w / zoom}
            height={noteHeight}
            fill={color}
            stroke="black"
            strokeWidth={1 / zoom}
          />
          <Text
            x={0}
            y={yPos + 2}
            text={`${i}:${getNoteName(i)}`}
            fontSize={12 / zoom}
            fill={isWhiteKey(i) ? "black" : "#ddd"}
            width={LEFT_PANEL_SIZE.w / zoom}
            align="left"
            height={noteHeight}
            verticalAlign="middle"
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
            step="0.0001"
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
            step="0.0001"
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
          <Layer x={LEFT_PANEL_SIZE.w / zoom} y={TOP_PANEL_SIZE.h / zoom}>
            <Group ref={contentGroupRef}>
              {renderPitchGrid()}
              {renderBarLines()}
              {renderNotes()}
            </Group>
          </Layer>
          <Layer x={0} y={TOP_PANEL_SIZE.h / zoom}>
            <Group ref={leftPanelGroupRef}>{renderPianoKeysAndLabels()}</Group>
          </Layer>
          <Layer>
            <Rect
              width={stageSize.width / zoom}
              height={TOP_PANEL_SIZE.h / zoom}
              fill={"#ddd"}
            />
            <Group y={0} x={LEFT_PANEL_SIZE.w / zoom}>
              <Group ref={topPanelGroupRef}>{renderBarHeaders()}</Group>
            </Group>
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PianoRoll;
