import React from 'react';
import { FitnessProvider } from './src/store/FitnessStore';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <FitnessProvider>
        <AppNavigator />
      </FitnessProvider>
    </ThemeProvider>
  );
}
