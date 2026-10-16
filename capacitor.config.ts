import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zvex.ruhani',
  appName: 'روحاني',
  webDir: 'dist',
  server: {
    url: 'https://ruhani.zvex.site',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
