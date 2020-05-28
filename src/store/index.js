import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    token: "",
    user: {},
  },
  reducers: {
    setUser(state, action) {
      return state.user = Object.assign({}, state.user, action.payload);
    },
    setToken(state, action) {
      state.token = action.payload;
      return;
    },
    clearUser(state, action) {
      return state = {
        token: "",
        user: {},
      };
    }
  }
});

const rootReducer = combineReducers({
  session: sessionSlice.reducer,
});

export const actions = {
  session: sessionSlice.actions,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: [...getDefaultMiddleware()],
});