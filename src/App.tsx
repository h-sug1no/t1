import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { AppContext, useAppContext, useAppContextReducer } from "./AppContext";
import VAEApp from "./vae/VAEApp";

// Suggested code may be subject to a license. Learn more: ~LicenseLog:1754968550.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3284899091.

const CountView = () => {
  const { state, dispatch } = useAppContext();

  const countView = useMemo(
    () => (
      <div className="card">
        <button onClick={() => dispatch({ type: "count/inc" })}>+</button>
        <button onClick={() => dispatch({ type: "count/dec" })}>-</button>
        <label>count is {state.count}</label>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    ),
    [dispatch, state.count]
  );

  return countView;
};

const AudioUIView = () => {
  const [, setRepaintCount] = useState(0);
  const { state } = useAppContext();
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

  const { audioData = {} } = state;
  const { audioElm } = audioData;
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
            <label>
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
          </div>
        </div>
      ) : null,
    [audioElm, currentTime, duration, loop, paused, playbackRate]
  );

  return ret;
};

const AudioDataView = () => {
  const { state, dispatch } = useAppContext();

  const loadCB = useCallback(
    async (url: string) => {
      try {
        dispatch({
          type: "audioData/loading",
          payload: {
            url,
            loading: true,
          },
        });
        const res = await fetch(url);
        const data = await res.arrayBuffer();
        const blob = new Blob([data], { type: `application/octet-stream` });
        const dataUrl = URL.createObjectURL(blob);
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(data);
        dispatch({
          type: "audioData/set",
          payload: {
            url,
            data: {
              dataUrl,
              audioBuffer,
            },
            loading: false,
          },
        });
      } catch (err: unknown) {
        dispatch({
          type: "audioData/error",
          payload: {
            url,
            error: err,
          },
        });
      }
    },
    [dispatch]
  );

  const { audioData } = state;
  const { dataUrl } = audioData?.data || {};
  const error = audioData?.error as Error;
  const ret = useMemo(() => {
    return (
      <div>
        {audioData?.url}
        <div>
          <textarea onChange={() => {}}></textarea>
        </div>
        <div>
          {audioData?.loading && "Loading..."}
          {error && error?.toString()}
        </div>
        <button
          onClick={() => {
            loadCB(
              "https://h-sug1no.github.io/test/audio-view-test/docs/DSSK1_bpm100.mp3"
            );
          }}
        >
          load
        </button>
        <AudioUIView />
        <div>
          {dataUrl && (
            <>
              <audio
                src={dataUrl}
                controls
                ref={(elm) => {
                  dispatch({
                    type: "audioData/set",
                    payload: { audioElm: elm },
                  });
                }}
              />
              <div>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(dataUrl);
                    dispatch({ type: "audioData/reset" });
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
  }, [audioData?.loading, audioData?.url, dataUrl, dispatch, error, loadCB]);
  return ret;
};

function NavigationMenu() {
  return [{ pathname: "/", label: "VAEApp" }, { pathname: "/audio" }].map(
    ({ pathname, label }) => {
      return window.location.pathname === pathname ? null : (
        <div>
          <a href={pathname}>{label ?? pathname}</a>
        </div>
      );
    }
  );
}

function App() {
  const [state, dispatch] = useAppContextReducer();
  const ret = useMemo(() => {
    return (
      <>
        <NavigationMenu />
        {window.location.pathname === "/audio" ? (
          <div className="App">
            <CountView />
            <AudioDataView />
          </div>
        ) : (
          <VAEApp />
        )}
      </>
    );
  }, []);
  return (
    <AppContext.Provider value={{ state, dispatch }}>{ret}</AppContext.Provider>
  );
}

export default App;
