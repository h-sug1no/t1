const DB_NAME = "myDatabase";
const OBJECT_STORE_NAME = "stateStore";

const toIDBRequest = (eventTarget: EventTarget | null) =>
  eventTarget as IDBRequest;

const openDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      reject(toIDBRequest(event.target)?.error);
    };

    request.onupgradeneeded = (event) => {
      const db = toIDBRequest(event.target)?.result as IDBDatabase;
      db.createObjectStore(OBJECT_STORE_NAME);
    };

    request.onsuccess = (event) => {
      resolve(toIDBRequest(event.target)?.result as IDBDatabase);
    };
  });
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const saveState = async (state: any): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([OBJECT_STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.put(state, "state");
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(toIDBRequest(event.target)?.error);
    });
  } catch (error) {
    console.error("State saving failed:", error);
  }
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const restoreState = async (): Promise<any> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([OBJECT_STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.get("state");
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return await new Promise<any>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(toIDBRequest(event.target)?.error);
    });
  } catch (error) {
    console.error("State restoring failed:", error);
    return null; // or reset to initial state.
  }
};

/*
const test = async (myState) => {
  await saveState(myState);

  const restoredState = await restoreState();
};
*/
