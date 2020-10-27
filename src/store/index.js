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
    setReferFriend(state, action) {
      log.debug("STORE:: set user refer friend id", action.payload);
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

const campaignSlice = createSlice({
  name: "campaign",
  initialState: {},
  reducers: {
    set(state, action) {
      log.debug("STORE:: set campaign", action.payload);
      state = Object.assign({}, state, action.payload);
      return state;
    },
    clear(state) {
      log.debug("STORE:: set campaign");
      state = {};
      return state;
    }
  }
})

const milestoneSlice = createSlice({
  name: "milestone",
  initialState: {
    sessions: [],
    hits: [],
  },
  reducers: {
    setSessions(state, action) {
      log.debug("STORE:: set user sessions", action.payload);
      state.sessions = state.sessions.concat(action.payload);
      return state;
    },
    addSession(state, action) {
      log.debug("STORE:: add user session", action.payload);
      state.sessions = [
        action.payload, 
        ...state.sessions.filter(item => {
          return item.session_id !== action.payload.session_id
        })
      ];
      return state;
    },
    setHits(state, action) {
      log.debug("STORE:: set milestones hits", action.payload);
      state.hits = [...action.payload];
      return state;
    },
    clear(state) {
      state.sessions = [];
      state.hits = [];
      return state;
    }
  }
})

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
});

const instructorSlice = createSlice({
  name: 'instructor',
  initialState: [],
  reducers: {
    set(state, action) {
      log.debug("STORE:: set instructors", action.payload);
      state = [...action.payload];
      return state;
    }
  }
});

const courseSlice = createSlice({
  name: 'course',
  initialState: [],
  reducers: {
    set(state, action) {
      log.debug("STORE:: set course data", action.payload);
      state = [...action.payload];
      return state;
    }
  }
});

const courseFeatureSlice = createSlice({
  name: 'courseFeature',
  initialState: [],
  reducers: {
    set(state, action) {
      log.debug("STORE:: set course data", action.payload);
      state = [
        action.payload, 
        ...state.filter(item => {
          return item.id !== action.payload.id
        })
      ];
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
  instructor: instructorSlice.reducer,
  course: courseSlice.reducer,
  courseFeature: courseFeatureSlice.reducer,
  milestone: milestoneSlice.reducer,
  campaign: campaignSlice.reducer,
});

export const actions = {
  user: userSlice.actions,
  theme: themeSlice.actions,
  feedback: feedbackSlice.actions,
  instructor: instructorSlice.actions,
  course: courseSlice.actions,
  courseFeature: courseFeatureSlice.actions,
  milestone: milestoneSlice.actions,
  campaign: campaignSlice.actions,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: [...getDefaultMiddleware()],
});