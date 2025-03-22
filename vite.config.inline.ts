import { fileURLToPath } from 'url';
import { defineConfig } from 'vite'
import { inlineHeadScriptOutDir } from './vite-plugins/constants';
import { addIcon } from './vite-plugins/add-icon';

export default defineConfig({
    build: {
        lib: {
            entry: fileURLToPath(new URL('./src/scripts/page/inline-head-script.ts', import.meta.url)),
            formats: ['iife'],
            fileName: 'index',
            name: 'inlineHeadScript'
        },
        outDir: inlineHeadScriptOutDir,
        emptyOutDir: true
    },
    plugins: [addIcon()]
})