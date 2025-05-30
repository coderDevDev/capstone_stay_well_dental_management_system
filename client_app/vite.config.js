// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   server: {
//     host: '0.0.0.0', // Allow access from external devices
//     port: 5173 // Ensure this is the correct port
//   },
//   plugins: [{ enforce: 'pre' }, react({ include: /\.(js|jsx|ts|tsx)$/ })]
// });

import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
