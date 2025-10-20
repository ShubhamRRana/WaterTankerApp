import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppComponent from './components/App';

export default function App(): React.ReactElement {
  return (
    <>
      <AppComponent />
      <StatusBar style="light" />
    </>
  );
}
