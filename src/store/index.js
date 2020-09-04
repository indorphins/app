import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';
import log from '../log';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: {},
    paymentData: {methods: []},
    schedule: [],
  },
  reducers: {
    set(state, action) {
      log.debug("STORE:: set user", action.payload);
      state.data = Object.assign({}, state.data, action.payload);
      return state;
    },
    setPaymentData(state, action) {
      log.debug("STORE:: set user payment data", action.payload);
      state.paymentData = Object.assign(state.paymentData, action.payload);
      return state;
    },
    setSchedule(state, action) {
      log.debug("STORE:: set user schedule", action.payload);
      state.schedule = [...action.payload];
      return state;
    },
    addScheduleItem(state, action) {
      log.debug("STORE:: add schedule item", action.payload);
      state.schedule = [action.payload, ...state.schedule];
      return state;
    },
    removeScheduleItem(state, action) {
      log.debug("STORE:: remove schedule item", action.payload);
      state.schedule = state.schedule.filter(item => {
        return item.id !== action.payload.id;
      });
      return state;
    },
    clear(state) {
      log.debug("STORE:: clear user data");
      state.data = {};
      state.paymentData = { methods: []};
      state.schedule = [];
      return state;
    }
  }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    show: false,
    course: {},
    sessionId: null,
  },
  reducers: {
    setShow(state, action) {
      log.debug("STORE:: set feedback show", action.payload);
      state.show = action.payload;
      return state;
    },
    setCourse(state, action) {
      log.debug("STORE:: set feedback course", action.payload);
      state.course = Object.assign(state.course, action.payload);
      return state;
    },
    setSessionId(state, action) {
      log.debug("STORE:: set feedback sessionID", action.payload);
      state.sessionId = action.payload;
      return state;
    }
  }
})

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
  feedback: feedbackSlice.reducer,
});

export const actions = {
  user: userSlice.actions,
  theme: themeSlice.actions,
  feedback: feedbackSlice.actions,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: [...getDefaultMiddleware()],
});