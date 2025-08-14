// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    integrations: [react(), tailwind()],
    output: 'static',
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport'
    },
    experimental: {
        clientPrerender: true // Mejora ViewTransitions
    }
});
