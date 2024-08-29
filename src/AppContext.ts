import { createContext, useContext, useReducer } from "react";

interface IAudioData {
  url?: string;
  data?: {
    dataUrl?: string;
    audioBuffer?: AudioBuffer;
  };
  error?: unknown;
  loading?: boolean;
  audioElm?: HTMLAudioElement | null;
}

interface IAppContextState {
  count: number;
  audioData: IAudioData;
}

const _initialState: IAppContextState = {
  count: 0,
  audioData: {
    url: undefined,
    data: {
      dataUrl: undefined,
      audioBuffer: undefined,
    },
    error: undefined,
    loading: false,
    audioElm: null,
  },
};

interface IAppContextStateActionBase {
  type: string;
}

export interface IAudioDataAction extends IAppContextStateActionBase {
  payload: IAudioData;
}

type IAppContextStateAction = IAppContextStateActionBase | IAudioDataAction;

function _parseActionType(actionType: string): { type: string; id: string } {
  const [type, id] = actionType.split("/");
  return { type, id };
}

function _countReducer(
  state: IAppContextState,
  _action: IAppContextStateAction,
  id: string,
): IAppContextState {
  switch (id) {
    case "inc":
      return { ...state, count: state.count + 1 };
    case "dec":
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

function _audioDataReducer(
  state: IAppContextState,
  action: IAppContextStateAction,
  id: string,
): IAppContextState {
  const payload = (action as IAudioDataAction).payload;
  switch (id) {
    case "loading":
    case "set":
    case "error":
      return {
        ...state,
        audioData: {
          ...state.audioData,
          ...payload,
        },
      };
    case "reset":
      return {
        ...state,
        audioData: {
          ..._initialState.audioData,
        },
      };
    default:
      return state;
  }
}

const reducers: Record<
  string,
  (
    state: IAppContextState,
    action: IAppContextStateAction,
    id: string,
  ) => IAppContextState
> = {};
reducers.count = _countReducer;
reducers.audioData = _audioDataReducer;

function reducer(
  state: IAppContextState,
  action: IAppContextStateAction,
): IAppContextState {
  const { type, id } = _parseActionType(action.type);

  const aReducer = reducers[type];
  if (aReducer) {
    return aReducer(state, action, id);
  }
  return state;
}

export function useAppContextReducer() {
  return useReducer(reducer, _initialState);
}

export const AppContext = createContext<{
  state: IAppContextState;
  dispatch: (action: IAppContextStateAction) => void;
}>({
  state: _initialState,
  dispatch: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}
