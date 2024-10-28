// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useRef } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import clsx from "clsx";
import {
  AppContext,
  createDeleteAction,
  createMergeAction,
  createResetAction,
  createUpdateAction,
  useAppContext,
  useAppContextReducer,
} from "./AppContext2";
import { ItemList } from "./AppSampleList";
import { restoreState, saveState } from "./AppStateStore";
import { arrayBufferToDataUrl } from "./utils/tsutils";
import VAEApp from "./vae/VAEApp";

// Suggested code may be subject to a license. Learn more: ~LicenseLog:1754968550.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3284899091.

const DBView = () => {
  const { state, dispatch } = useAppContext();
  const ret = useMemo(() => {
    return (
      <div className="uiContainer">
        IndexedDB store test:
        <button
          type="button"
          onClick={() => {
            saveState(state);
          }}
        >
          save
        </button>
        <button
          type="button"
          onClick={async () => {
            const newState = await restoreState();
            if (newState) {
              dispatch(createResetAction(newState));
            }
          }}
        >
          restore
        </button>
      </div>
    );
  }, [dispatch, state]);
  return ret;
};

let nRender = 0;
const CountView2 = ({ count }: { count: number }) => {
  console.log(nRender++);
  return `CountView2: count=${count}`;
};
const CountView = () => {
  const { state, dispatch } = useAppContext();
  const countView = useMemo(
    () => (
      <div className="card">
        <button
          type="button"
          onClick={() => dispatch(createUpdateAction("count", state.count + 1))}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => dispatch(createUpdateAction("count", state.count - 1))}
        >
          -
        </button>
        <label>count is {state.count}</label>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    ),
    [dispatch, state.count],
  );

  return countView;
};

const T = () => {
  return <span />;
};

const AudioUIView = ({ audioElm }: { audioElm: HTMLMediaElement | null }) => {
  const [, setRepaintCount] = useState(0);
  const { state } = useAppContext();
  const { audioData = {} } = state;

  useEffect(() => {
    let requestId: number;
    const draw = () => {
      setRepaintCount((v) => v + 1);
      requestId = requestAnimationFrame(draw);
    };

    requestId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  const playbackRateInputRef = useRef({
    tid: 0,
    value: 1,
  });
  const onPlaybackRateInput = useCallback(
    (e) => {
      const { current } = playbackRateInputRef;
      const v = Number(e.target.value);
      if (v <= 0) {
        return;
      }
      current.value = v;
      window.clearTimeout(current.tid);
      current.tid = window.setTimeout(() => {
        if (audioElm) {
          audioElm.playbackRate = current.value;
        }
        current.tid = 0;
      }, 1000);
    },
    [audioElm],
  );

  const { current: playbackRateInput } = playbackRateInputRef;
  const isPending = !!playbackRateInput.tid;
  const { currentTime, duration, paused, playbackRate, loop } = audioElm
    ? audioElm
    : {
        currentTime: 0,
        duration: 0,
        paused: true,
        playbackRate: 1,
        loop: false,
      };

  const ret = useMemo(
    () =>
      audioElm ? (
        <div className="audio-view">
          {currentTime.toFixed(2)} /{duration.toFixed(2)}:{playbackRate}
          <div className="audio-view-controls">
            <button
              type="button"
              onClick={() => {
                if (paused) {
                  audioElm.play();
                } else {
                  audioElm.pause();
                }
              }}
            >
              {paused ? "play" : "pause"}
            </button>
            <label className="loop-label">
              <input
                type="checkbox"
                className="loop-checkbox"
                checked={loop}
                onChange={() => {
                  audioElm.loop = !loop;
                }}
              />
              : loop
            </label>
            <label className="playbackRate-label">
              playbackRate:
              <input
                className={isPending ? "pending" : null}
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={isPending ? playbackRateInput.value : playbackRate}
                onInput={onPlaybackRateInput}
              />
            </label>
          </div>
        </div>
      ) : null,
    [
      audioElm,
      currentTime,
      duration,
      isPending,
      loop,
      onPlaybackRateInput,
      paused,
      playbackRate,
      playbackRateInput.value,
    ],
  );

  // test
  return ret;
};

const AudioFileInputView = () => {
  const { /*state,*/ dispatch } = useAppContext();
  const audioFileInputRef = useRef();
  const [isHover, setIsHover] = useState(false);

  const loadFileCB = useCallback(async () => {
    const elm = audioFileInputRef.current;
    if (!elm) {
      return;
    }
    const { files } = elm;
    if (!files || !files[0]) {
      return;
    }
    return new Promise((resolve, reject) => {
      const file = files[0];
      const url = `local file: ${file.name}: ${file.size} bytes`;
      try {
        dispatch(
          createUpdateAction("audioData", {
            url,
            loading: true,
          }),
        );

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = e.target.result;
            const dataUrl = arrayBufferToDataUrl(data, file.type);
            const audioContext = new AudioContext();
            const newData = {
              dataUrl,
            };
            dispatch(
              createUpdateAction("audioData", {
                url,
                data: newData,
                loading: false,
              }),
            );
            resolve(0);
          } catch (err: unknown) {
            dispatch(
              createUpdateAction("audioData", {
                url,
                error: err,
              }),
            );
            reject(-1);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err: unknown) {
        dispatch(
          createUpdateAction("audioData", {
            url,
            error: err,
          }),
        );
        reject(-2);
      }
    });
  }, [dispatch]);

  const tf = useCallback(() => {
    setIsHover(false);
  }, []);
  const ret = useMemo(() => {
    return (
      <div className="inputContainer">
        <label className="audioFileInputLabel">
          <input
            type="file"
            className={clsx("audioFileInput", isHover ? "hover" : "")}
            ref={(elm) => {
              audioFileInputRef.current = elm;
            }}
            onChange={loadFileCB}
            onDragOver={() => {
              setIsHover(true);
            }}
            onDragLeave={tf}
            onDrop={tf}
            onDragEnd={tf}
          />
        </label>
        <button type="button" onClick={loadFileCB}>
          load
        </button>
      </div>
    );
  }, [isHover, loadFileCB, tf]);
  return ret;
};

const AudioDataView = () => {
  const [audioElm, setAudioElm] = useState<HTMLMediaElement | null>(null);

  const { state, dispatch } = useAppContext();
  const textareaRef = useRef();
  const loadCB = useCallback(
    async (url: string) => {
      try {
        dispatch(
          createUpdateAction("audioData", {
            url,
            loading: true,
            error: undefined,
          }),
        );
        const res = await fetch(url);
        const type = res.headers.get("content-type");
        const data = await res.arrayBuffer();
        const dataUrl = arrayBufferToDataUrl(data, type);
        const audioContext = new AudioContext();
        dispatch(
          createUpdateAction("audioData", {
            url,
            data: {
              dataUrl,
            },
            loading: false,
          }),
        );
      } catch (err: unknown) {
        dispatch(
          createUpdateAction("audioData", {
            url,
            error: err,
          }),
        );
      }
    },
    [dispatch],
  );

  const { audioData } = state;
  const { dataUrl } = audioData?.data || {};

  const error = audioData?.error as Error;
  const ret = useMemo(() => {
    return (
      <div className="uiContainer">
        audio file or url test:
        {audioData?.url}
        <div>
          {audioData?.loading && "Loading..."}
          {error?.toString()}
        </div>
        <div className="inputContainer">
          <div>
            <textarea
              id="audio-resource-url"
              autoComplete="on"
              title="specify url of audio resource"
              onChange={() => {}}
              ref={(elm) => {
                textareaRef.current = elm;
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const url = textareaRef.current?.value;
              if (url) {
                loadCB(url);
              }
            }}
          >
            load
          </button>
        </div>
        <AudioFileInputView />
        <AudioUIView audioElm={audioElm} />
        <div>
          {dataUrl && (
            <>
              <audio
                autoPlay
                src={dataUrl}
                controls
                ref={(elm) => {
                  setAudioElm(elm);
                }}
              >
                <track kind="captions" />
              </audio>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(
                      createUpdateAction("audioData", {
                        data: {},
                      }),
                    );
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }, [
    audioData?.loading,
    audioData?.url,
    dataUrl,
    dispatch,
    error,
    loadCB,
    audioElm,
  ]);
  return ret;
};

function NavigationMenu() {
  return [
    { pathname: "/VAEApp", label: "VAEApp" },
    { pathname: "/", label: "audio" },
  ].map(({ pathname, label }) => {
    return window.location.pathname === pathname ? null : (
      <div key={`${pathname}_${label}`}>
        <a href={pathname}>{label ?? pathname} →</a>
      </div>
    );
  });
}

function TestDataView() {
  const { state, dispatch } = useAppContext();

  const testData = state.testData;
  const { stringValue, numberValue } = testData ?? {};

  const ret = useMemo(() => {
    return (
      <div className="uiContainer">
        context action test:
        <div>
          {testData && (
            <>
              numberValue: {numberValue ?? "undefined"}, stringValue:{" "}
              {stringValue ?? "undefined"},
            </>
          )}
        </div>
        <div>
          <button
            disabled={!testData}
            type="button"
            onClick={() => {
              dispatch(createDeleteAction("testData"));
            }}
          >
            delete
          </button>

          <button
            disabled={testData}
            type="button"
            onClick={() => {
              dispatch(createUpdateAction("testData", {}));
            }}
          >
            init
          </button>

          <button
            type="button"
            disabled={!testData}
            onClick={() => {
              dispatch(
                createMergeAction("testData", {
                  numberValue: (numberValue ?? 0) + 1,
                }),
              );
            }}
          >
            change numberValue
          </button>
          <button
            type="button"
            disabled={!testData}
            onClick={() => {
              dispatch(
                createMergeAction("testData", {
                  stringValue: `${stringValue ?? ""}a`,
                }),
              );
            }}
          >
            change stringValue
          </button>
        </div>
      </div>
    );
  }, [stringValue, numberValue, dispatch, testData]);
  return ret;
}

function App() {
  const [state, dispatch] = useAppContextReducer();
  const ret = useMemo(() => {
    return (
      <>
        <NavigationMenu />
        {window.location.pathname === "/" ? (
          <div className="App">
            <ItemList />
            <TestDataView />
            <CountView />
            <AudioDataView />
            <DBView />
          </div>
        ) : (
          <VAEApp />
        )}
      </>
    );
  }, []);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <CountView2 count={state.count} />
      {ret}
    </AppContext.Provider>
  );
}

export default App;
