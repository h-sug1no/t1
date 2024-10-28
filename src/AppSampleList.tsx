import { useCallback, useEffect, useMemo } from "react";
import {
  type ISampleListItem,
  createMergeAction,
  useAppContext,
} from "./AppContext2";
// import { fetchItems } from "../api/items"; // Import the stub function
// src/api/items.js

const dummyData = Array.from({ length: 100 }, (_, i) => {
  return {
    id: i + 1,
    name: `Item ${i + 1}`,
    // Add other properties as needed
  };
});

export const fetchItems = async (page = 1, limit = 10) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items: ISampleListItem[] = dummyData.slice(startIndex, endIndex);

  return {
    maxPage: dummyData.length / limit,
    items,
  };
};

// src/components/ItemList.js

export const ItemList = () => {
  const { state, dispatch } = useAppContext(); // ... (rest of your component code)

  const { sampleListData } = state;

  const loadMore = useCallback(async () => {
    const fetchItemsData = async () => {
      dispatch(
        createMergeAction("sampleListData", {
          loading: true,
        }),
      );
      const newPage = sampleListData.page + 1;
      const { items, maxPage } = await fetchItems(newPage, 10);
      dispatch(
        createMergeAction("sampleListData", {
          loading: false,
          maxPage,
          page: newPage,
          items: [...sampleListData.items, ...items],
        }),
      );
    };
    fetchItemsData();
  }, [dispatch, sampleListData.page, sampleListData.items]);

  useEffect(() => {
    if (!sampleListData.page) {
      loadMore();
    }
  }, [loadMore, sampleListData.page]);

  const ret = useMemo(() => {
    return (
      <div className="uiContainer itemList">
        {sampleListData.page} / {sampleListData.maxPage}
        <div className="header">
          <div className="row">
            <div className="col idx">idx</div>
            <div className="col id">id</div>
            <div className="col name">name</div>
          </div>
        </div>
        <div className="body">
          {sampleListData.items.map((v, idx) => {
            return (
              <div key={v.id} className="row">
                <div className="col idx">{idx}</div>
                <div className="col id">{v.id}</div>
                <div className="col name">{v.name}</div>
              </div>
            );
          })}
          <div className="row">
            <button
              disabled={sampleListData.page >= sampleListData.maxPage}
              type="button"
              onClick={() => {
                loadMore();
              }}
            >
              More
            </button>
          </div>
        </div>
      </div>
    );
  }, [
    loadMore,
    sampleListData.items,
    sampleListData.maxPage,
    sampleListData.page,
  ]);
  return ret;
};
