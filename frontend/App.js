import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/redux/store';
import MainAppContainer from './src/screens/MainAppContainer';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MainAppContainer />
      </SafeAreaProvider>
    </Provider>
  );
}
