import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices

import userReducer from './slices/user';
import customiserReducer from './slices/customiser';
import notificationReducer from './slices/notification';
import reportsReducer from './slices/reports';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: []
};

const rootReducer = combineReducers({
  user: userReducer,
  customiser: customiserReducer,
  notification: notificationReducer,
  reports: reportsReducer
});

export { rootPersistConfig, rootReducer };
