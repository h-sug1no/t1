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
  const { page, maxPage, items, loading } = sampleListData;

  const loadMore = useCallback(async () => {
    const fetchItemsData = async () => {
      dispatch(
        createMergeAction("sampleListData", {
          loading: true,
        }),
      );
      const newPage = page + 1;
      const { items: newItems, maxPage: tMaxPage } = await fetchItems(
        newPage,
        10,
      );
      dispatch(
        createMergeAction("sampleListData", {
          loading: false,
          maxPage: tMaxPage,
          page: newPage,
          items: [...items, ...newItems],
        }),
      );
    };
    fetchItemsData();
  }, [dispatch, page, items]);

  useEffect(() => {
    if (!sampleListData.page) {
      loadMore();
    }
  }, [loadMore, sampleListData.page]);

  const canLoadMore = page < maxPage;
  const ret = useMemo(() => {
    return (
      <div className="uiContainer itemList">
        {page} / {maxPage}
        <div className="header">
          <div className="row">
            <div className="col idx">idx</div>
            <div className="col id">id</div>
            <div className="col name">name</div>
          </div>
          {loading && <div className="loadingDlg">Loading...</div>}
        </div>
        <div
          className="body"
          onScroll={(e) => {
            const { scrollTop, clientHeight, scrollHeight } =
              e.target as HTMLDivElement;
            if (
              canLoadMore &&
              !loading &&
              scrollHeight - (scrollTop + clientHeight) <= 0
            ) {
              loadMore();
            }
          }}
        >
          <>
            {items.map((v, idx) => {
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
                disabled={!canLoadMore}
                type="button"
                onClick={() => {
                  loadMore();
                }}
              >
                More
              </button>
            </div>
          </>
        </div>
      </div>
    );
  }, [loadMore, items, maxPage, page, loading, canLoadMore]);
  return ret;
};
