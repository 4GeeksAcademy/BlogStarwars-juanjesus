// src/store.js
const BASE = "https://www.swapi.tech/api";

export const initialStore = () => ({
  people: [],
  planets: [],
  starships: [],
  vehicles: [],
  films: [],
  species: [],
  favorites: [],
  loadingList: {},
  detail: {},        
  loadingDetail: {}, 
  error: null,
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "SET_LIST": {
      const { resource, results } = action.payload;
      return {
        ...store,
        [resource]: results,
        loadingList: { ...store.loadingList, [resource]: false },
      };
    }

    case "SET_LOADING_LIST": {
      const { resource, value } = action.payload;
      return {
        ...store,
        loadingList: { ...store.loadingList, [resource]: value },
      };
    }

    case "SET_DETAIL": {
      const { category, data } = action.payload;
      return {
        ...store,
        detail: { ...store.detail, [category]: data },
        loadingDetail: { ...store.loadingDetail, [category]: false },
      };
    }

    case "SET_LOADING_DETAIL": {
      const { category, value } = action.payload;
      return {
        ...store,
        loadingDetail: { ...store.loadingDetail, [category]: value },
      };
    }

    case "ADD_FAVORITE": {
      const item = action.payload;
      const exists = store.favorites.some(
        (f) => f.type === item.type && f.uid === item.uid
      );
      if (exists) return store;
      return { ...store, favorites: [...store.favorites, item] };
    }

    case "REMOVE_FAVORITE": {
      const { type, uid } = action.payload;
      return {
        ...store,
        favorites: store.favorites.filter(
          (f) => !(f.type === type && f.uid === uid)
        ),
      };
    }

    default:
      console.warn("Unknown action type:", action.type);
      return store;
  }
}

async function safeFetch(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

export const storeActions = {
  fetchList: async (dispatch, resource, options = {}) => {
    const { page = 1, limit = 10 } = options;
    try {
      dispatch({ type: "SET_LOADING_LIST", payload: { resource, value: true } });
      const url = `${BASE}/${resource}/?page=${page}&limit=${limit}`;
      const json = await safeFetch(url);

      const results = Array.isArray(json.results)
        ? json.results
        : Array.isArray(json.result)
        ? json.result
        : [json.result];

      const normalized = results.map((item) =>
        item.properties ? { uid: item.uid, ...item.properties } : item
      );

      dispatch({ type: "SET_LIST", payload: { resource, results: normalized } });
      return normalized;
    } catch (error) {
      dispatch({ type: "SET_LOADING_LIST", payload: { resource, value: false } });
      console.error("fetchList error", error);
      throw error;
    }
  },

  fetchDetail: async (dispatch, category, uid) => {
    try {
      dispatch({ type: "SET_LOADING_DETAIL", payload: { category, value: true } });
      const json = await safeFetch(`${BASE}/${category}/${uid}`);
      const data = json.result?.properties
        ? { uid: json.result.uid, ...json.result.properties }
        : json.result;
      dispatch({ type: "SET_DETAIL", payload: { category, data } });
      return data;
    } catch (error) {
      dispatch({ type: "SET_LOADING_DETAIL", payload: { category, value: false } });
      console.error("fetchDetail error", error);
      throw error;
    }
  },

  addFavorite: (dispatch, item) => {
    if (!item || !item.type || !item.uid) throw Error("addFavorite: invalid item");
    dispatch({ type: "ADD_FAVORITE", payload: item });
  },

  removeFavorite: (dispatch, type, uid) => {
    dispatch({ type: "REMOVE_FAVORITE", payload: { type, uid } });
  },
};
