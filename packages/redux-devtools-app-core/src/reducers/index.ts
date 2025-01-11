import { section, SectionState } from './section';
import { monitor, MonitorState } from './monitor';
import { notification, NotificationState } from './notification';
import { instances, InstancesState } from './instances';
import { reports, ReportsState } from './reports';
import { theme, ThemeState } from './theme';
import { stateTreeSettings, StateTreeSettings } from './stateTreeSettings';
import { TModel } from '../components/Settings/AIConfig';
import { TStoreWhisper, whisperReducer } from './aiconfig'
export interface CoreStoreState {
  readonly section: SectionState;
  readonly theme: ThemeState;
  readonly stateTreeSettings: StateTreeSettings;
  readonly monitor: MonitorState;
  readonly instances: InstancesState;
  readonly reports: ReportsState;
  readonly notification: NotificationState;
  readonly whisper: TStoreWhisper;
}

export const coreReducers = {
  section,
  theme,
  stateTreeSettings,
  monitor,
  instances,
  reports,
  notification,
  whisperReducer
};
