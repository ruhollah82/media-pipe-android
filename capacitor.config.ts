import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.bodyregions',
  appName: 'Body Regions',
  webDir: 'dist',
  android: {
    androidScheme: 'https',
  },
};

export default config;
