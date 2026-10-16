import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zvex.ruhani',
  appName: 'Ruhani',
  webDir: 'dist',
  server: {
    url: 'https://ruhani.zvex.site',
    cleartext: false
  }
};

export default config;
