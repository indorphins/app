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
    clear(state, action) {
      log.debug("STORE:: clear user data");
      state = {
        data: {},
      };
    }
  }
});

const rootReducer = combineReducers({
  user: userSlice.reducer,
});

export const actions = {
  user: userSlice.actions,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: [...getDefaultMiddleware()],
});