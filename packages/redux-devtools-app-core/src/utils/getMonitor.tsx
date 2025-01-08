import React from 'react';
import { LogMonitor } from '@redux-devtools/log-monitor';
import ChartMonitorWrapper from '../containers/monitors/ChartMonitorWrapper';
import InspectorWrapper from '../containers/monitors/InspectorWrapper';
import { RtkQueryMonitor } from '@redux-devtools/rtk-query-monitor';
import WhisperChat from '../containers/monitors/Whisper';

export const monitors = [
  { value: 'InspectorMonitor', name: 'Inspector' },
  { value: 'LogMonitor', name: 'Log monitor' },
  { value: 'ChartMonitor', name: 'Chart' },
  { value: 'RtkQueryMonitor', name: 'RTK Query' },
  { value: 'Redux-Whisper', name: 'Redux Whisper'}
];

export default function getMonitor({ monitor }: { monitor: string }) {
  switch (monitor) {
    case 'LogMonitor':
      return (
        <LogMonitor preserveScrollTop={false} hideMainButtons markStateDiff />
      );
    case 'ChartMonitor':
      return <ChartMonitorWrapper />;
    case 'RtkQueryMonitor':
      return <RtkQueryMonitor />;
    case 'Redux-Whisper': {
      return <WhisperChat />;
    }
    default:
      return <InspectorWrapper />;
  }
}