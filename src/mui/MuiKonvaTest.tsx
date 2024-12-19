import type Konva from "konva";
import React, { useCallback, useMemo, useState } from "react";
import { Layer, Stage, Star, Text } from "react-konva";
import PianoRoll from "./MuiKonvaPianoroll";

//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * 4000,
    y: Math.random() * 1000,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}

const INITIAL_STATE = generateShapes();

const MuiKonvaTest0 = () => {
  const [stars, setStars] = React.useState(INITIAL_STATE);

  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const handleDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const id = e.target.id();
      setStars(
        stars.map((star) => {
          return {
            ...star,
            isDragging: star.id === id,
          };
        }),
      );
    },
    [stars.map],
  );
  const handleDragEnd = useCallback((
    /*e: Konva.KonvaEventObject<DragEvent>*/
  ) => {
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      }),
    );
  }, [stars.map]);

  const stage = useMemo(() => {
    return (
      containerSize.w &&
      containerSize.h && (
        <Stage
          width={containerSize.w}
          height={containerSize.h}
          scale={{ x: 0.1, y: 0.1 }}
        >
          <Layer>
            <Text text="Try to drag a star" />
            {stars.map((star) => (
              <Star
                key={star.id}
                id={star.id}
                x={star.x}
                y={star.y}
                numPoints={5}
                innerRadius={20}
                outerRadius={40}
                fill="#89b717"
                opacity={0.8}
                draggable
                rotation={star.rotation}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.6}
                shadowOffsetX={star.isDragging ? 10 : 5}
                shadowOffsetY={star.isDragging ? 10 : 5}
                scaleX={star.isDragging ? 1.2 : 1}
                scaleY={star.isDragging ? 1.2 : 1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Layer>
        </Stage>
      )
    );
  }, [
    handleDragEnd,
    handleDragStart,
    stars.map,
    containerSize.h,
    containerSize.w,
  ]);

  const ret = useMemo(
    () => (
      <div
        className="konvaStageContainer"
        ref={(divElm: HTMLDivElement) => {
          setContainerSize({
            w: divElm?.clientWidth || 0,
            h: divElm?.clientHeight || 0,
          });
        }}
        style={{
          width: "calc(100vw - 200px)",
          height: "70vh",
          backgroundColor: "#ddd",
        }}
      >
        {stage}
      </div>
    ),
    [stage],
  );
  return ret;
};

const use0 = false;
export const MuiKonvaTest = () => {
  if (use0) {
    return <MuiKonvaTest0 />;
  }
  return <PianoRoll numOfBars={8} ppqn={960} />;
};
