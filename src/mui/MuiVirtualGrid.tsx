import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import Measure, { type ContentRect } from "react-measure";
import {
  VariableSizeGrid as Grid,
  type GridChildComponentProps,
} from "react-window";

const testItemsData = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

export interface MuiVirtualGridRenderCardProps<T> {
  data: T[];
  columnCount: number;
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}

interface MuiVirtualGridProps<T> {
  cardWidth: number;
  cardHeight: number;
  gutter: number;
  itemsData: T[];
  renderCard: (props: MuiVirtualGridRenderCardProps<T>) => React.ReactNode;
  gridRef: React.MutableRefObject<
    | {
        gridApiRef: React.MutableRefObject<Grid | null>;
        scrollToItemIdx: (itemIdx: number) => void;
      }
    | undefined
  >;
}

export const MuiVirtualGrid = <T,>({
  cardWidth,
  cardHeight,
  gutter,
  itemsData,
  renderCard,
  gridRef,
}: MuiVirtualGridProps<T>) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [columns, setColumns] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridApiRef = useRef<Grid | null>(null);
  const [scrollPos, setScrollPos] = useState<
    { scrollTop: number; scrollLeft: number } | undefined
  >(undefined);
  const onResize = useCallback(
    (contentRect: ContentRect) => {
      const calculateColumns = (width: number) =>
        Math.max(1, Math.floor(width / (cardWidth + gutter)));
      const { client } = contentRect;
      if (client) {
        const gridElm = containerRef.current?.querySelector(
          ".MuiVirtualGrid",
        ) as HTMLDivElement;
        const size = {
          width: Math.max(
            0,
            client.width -
              ((gridElm?.offsetWidth || 0) - (gridElm?.clientWidth || 0)),
          ),
          height: client.height,
        };
        window.setTimeout(() => {
          console.log(size);
          const st = gridApiRef.current?.state
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              { ...(gridApiRef.current.state as any) }
            : undefined;
          setContainerSize(size);
          setColumns(calculateColumns(size.width));
          if (st) {
            setScrollPos(st);
          }
        });
      }
    },
    [cardWidth, gutter],
  );

  useMemo(() => {
    const tRef = gridRef;
    tRef.current = {
      gridApiRef,

      scrollToItemIdx: (itemIdx: number) => {
        const rowIndex = Math.floor(itemIdx / columns);
        const columnIndex = itemIdx % columns;
        gridApiRef.current?.scrollToItem({
          rowIndex,
          columnIndex,
          align: "center",
        });
      },
    };
  }, [columns, gridRef]);

  const ret = useMemo(() => {
    const Foo = ({
      measureRef,
      children,
    }: {
      measureRef: (ref: Element | null) => void;
      children: React.ReactNode;
    }) => (
      <div
        className="MuiVirtualGridContainer"
        ref={useCallback(
          (e: HTMLDivElement | null) => {
            containerRef.current = e;
            return measureRef(e);
          },
          [measureRef],
        )}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        {children}
      </div>
    );
    return (
      <Measure bounds client onResize={onResize}>
        {({ measureRef }) => (
          <Foo measureRef={measureRef}>
            <Grid
              ref={(elm) => {
                gridApiRef.current = elm;
              }}
              className="MuiVirtualGrid"
              estimatedColumnWidth={150}
              estimatedRowHeight={150}
              columnCount={columns}
              columnWidth={() => cardWidth + gutter}
              rowCount={Math.ceil(itemsData.length / columns)}
              rowHeight={() => cardHeight + gutter}
              width={containerSize.width}
              height={containerSize.height}
              itemData={itemsData}
              style={{ width: "100% !important" }}
              initialScrollLeft={scrollPos?.scrollLeft}
              initialScrollTop={scrollPos?.scrollTop}
            >
              {({
                columnIndex,
                rowIndex,
                style,
                data,
              }: GridChildComponentProps<T[]>) =>
                renderCard({
                  data,
                  columnCount: columns,
                  columnIndex,
                  rowIndex,
                  style,
                })
              }
            </Grid>
          </Foo>
        )}
      </Measure>
      // eslint-disable-next-line max-len
    );
  }, [
    cardHeight,
    cardWidth,
    columns,
    containerSize.height,
    containerSize.width,
    gutter,
    itemsData,
    onResize,
    renderCard,
    scrollPos?.scrollLeft,
    scrollPos?.scrollTop,
  ]);
  return ret;
};
type CardProps = MuiVirtualGridRenderCardProps<string>;

export const Card: React.FC<CardProps> = ({
  data,
  columnIndex,
  columnCount,
  rowIndex,
  style,
}: CardProps) => {
  const item = data[rowIndex * columnCount + columnIndex];
  return item ? (
    <div
      style={{
        ...style,
        boxSizing: "border-box",
        border: "solid gray 1px",
        padding: "5px",
        borderRadius: "5px",
        backgroundColor: "tan",
      }}
    >
      <p>{`Row: ${rowIndex}, Column: ${columnIndex}`}</p>
      <p>{`Item: ${item ?? "N/A"}`}</p>
    </div>
  ) : null;
};

export const MuiVirtualGridTest = () => {
  const gridRef = useRef(undefined);
  return (
    <div
      style={{ width: "calc(100vw - 700px)", height: "calc(100vh - 300px)" }}
    >
      <MuiVirtualGrid<string>
        cardHeight={150}
        cardWidth={150}
        gutter={0}
        itemsData={testItemsData}
        gridRef={gridRef}
        renderCard={(props) => (
          <Card
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        )}
      />
    </div>
  );
};
