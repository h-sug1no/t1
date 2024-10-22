import { createContext, useContext, useReducer } from "react";

//////////////////////////////////////////////////////////
export interface IAudioBufferData {
  dataUrl?: string;
  audioBuffer?: AudioBuffer;
}

export interface IAudioData {
  url?: string;
  data?: IAudioBufferData;
  error?: unknown;
  loading?: boolean;
}

export interface IAppContextState {
  count: number;
  audioData: IAudioData;
}

const _initialState0: IAppContextState = {
  count: 0,
  audioData: {
    url: undefined,
    data: {
      dataUrl: undefined,
      audioBuffer: undefined,
    },
    error: undefined,
    loading: false,
  },
};

type IStateTypes =
  | IAppContextState
  | undefined
  | string
  | number
  | IAudioBufferData
  | IAudioData
  | boolean;

//////////////////////////////////////////////////////////

enum AppContextActionType {
  RESET = "appContext/RESET",
  UPDATE = "appContext/UPDATE",
  MERGE = "appContext/MERGE",
  DELETE = "appContext/DELETE",
}
export interface IAppStateAction {
  type: AppContextActionType;
  path: string;
  value?: IStateTypes; // for update|merge
}

const createUpdateAction = (
  path: string,
  value: IStateTypes,
): IAppStateAction => ({
  type: AppContextActionType.UPDATE,
  path,
  value,
});

const createMergeAction = (
  path: string,
  value: Record<string, IStateTypes>,
): IAppStateAction => ({
  type: AppContextActionType.MERGE,
  path,
  value,
});

const createDeleteAction = (path: string): IAppStateAction => ({
  type: AppContextActionType.DELETE,
  path,
});

const getNestedTarget = <T>(
  obj: T,
  path: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): { newObj: T; target: any; lastKey: string } => {
  const keys = path.split(".");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const temp: any = { ...obj };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let target: any = temp;

  const keyArray = keys.slice(0, -1);

  for (const key of keyArray) {
    target[key] = { ...target[key] };
    target = target[key];
  }

  return { newObj: temp, target, lastKey: keys[keys.length - 1] };
};

const setNestedState = <T>(obj: T, path: string, value: unknown): T => {
  const { newObj, target, lastKey } = getNestedTarget(obj, path);
  target[lastKey] = value;
  return newObj;
};

const mergeNestedState = <T>(
  obj: T,
  path: string,
  value: Record<string, unknown>,
): T => {
  const { newObj, target, lastKey } = getNestedTarget(obj, path);
  target[lastKey] = {
    ...target[lastKey],
    ...value,
  };
  return newObj;
};

const deleteNestedState = <T>(obj: T, path: string): T => {
  const { newObj, target, lastKey } = getNestedTarget(obj, path);
  delete target[lastKey];
  return newObj;
};

const appReducer = (
  state: IAppContextState | undefined,
  action: IAppStateAction,
): IAppContextState => {
  let ret: IAppContextState = state as IAppContextState;
  if (action.type === AppContextActionType.RESET) {
    ret = { ...(action.value as IAppContextState) };
  } else if (!action.path) {
    throw new Error("empty action.path, use RESET action");
  } else if (!state) {
    throw new Error("empty state, Bad action.type or use RESET action");
  }

  if (state) {
    switch (action.type) {
      case AppContextActionType.UPDATE:
        ret = setNestedState(state, action.path, action.value);
        break;
      case AppContextActionType.MERGE:
        ret = mergeNestedState(
          state,
          action.path,
          action.value as Record<string, unknown>,
        );
        break;
      case AppContextActionType.DELETE:
        ret = deleteNestedState(state, action.path);
        break;
      default:
        break;
    }
  }

  console.log("appReducer", state, action, ret);
  return ret;
};

const _initialState = appReducer(undefined, {
  type: AppContextActionType.RESET,
  path: "",
  value: _initialState0,
});

export function useAppContextReducer() {
  return useReducer(appReducer, _initialState);
}

export const AppContext = createContext<{
  state: IAppContextState;
  dispatch: (action: IAppStateAction) => void;
}>({
  state: _initialState,
  dispatch: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}

export { createDeleteAction, createMergeAction, createUpdateAction };
