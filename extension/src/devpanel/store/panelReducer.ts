import { combineReducers, Reducer } from 'redux';
import {
  connection,
  instances,
  monitor,
  notification,
  reports,
  section,
  socket,
  stateTreeSettings,
  StoreAction,
  StoreState,
  theme,
  aiConfigReducer,
} from '@redux-devtools/app';

const rootReducer: Reducer<
  StoreState,
  StoreAction,
  Partial<StoreState>
> = combineReducers({
  instances,
  monitor,
  reports,
  notification,
  section,
  socket,
  theme,
  connection,
  stateTreeSettings,
  aiConfig: aiConfigReducer
}) as any;

export default rootReducer;
