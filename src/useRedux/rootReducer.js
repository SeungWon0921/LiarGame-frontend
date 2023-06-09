import { combineReducers } from "redux";
import room from "../modules/room";

import  characterpop  from "../modules/character";
import popup from "../modules/popup";
import { persistReducer } from "redux-persist"; // 추가
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["room"],
};

const rootReducer = combineReducers({
  popup,
  room,
  characterpop,
});

export default persistReducer(persistConfig, rootReducer);
