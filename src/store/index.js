import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';
import log from '../log';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: {},
  },
  reducers: {
    set(state, action) {
      log.debug("STORE:: set user", action.payload);
      state.data = Object.assign({}, state.data, action.payload);
    },
    clear(state) {
      log.debug("STORE:: clear user data");
      state.data = {};
      return state;
    }
  }
});

const themeSlice = createSlice({
  name: 'theme',
  initialState: 'light',
  reducers: {
    setDarkMode(state) {
      log.debug("STORE:: set dark theme");
      state = 'dark';
      return state;
    },
    setLightMode(state) {
      log.debug("STORE:: set light theme");
      state = 'light';
      return state;
    }
  }
});

const rootReducer = combineReducers({
  user: userSlice.reducer,
  theme: themeSlice.reducer,
});

export const actions = {
  user: userSlice.actions,
  theme: themeSlice.actions
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: [...getDefaultMiddleware()],
});