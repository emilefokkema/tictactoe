import { fileURLToPath } from 'url';
import path from 'path';
import { readFile } from 'fs/promises';
import { defineConfig, type HtmlTagDescriptor, type InlineConfig, type PluginOption, build } from 'vite'

const inlineHeadScriptOutDir = fileURLToPath(new URL('./dist-inline-head-script', import.meta.url));
const inlineHeadScriptFilePath = path.resolve(inlineHeadScriptOutDir, 'index.iife.js')
const inlineHeadScriptConfig: InlineConfig = {
    build: {
        lib: {
            entry: fileURLToPath(new URL('./src/scripts/page/inline-head-script.ts', import.meta.url)),
            formats: ['iife'],
            fileName: 'index',
            name: 'inlineHeadScript'
        },
        outDir: inlineHeadScriptOutDir,
        emptyOutDir: true
    }
};

function injectInlineHeadScript(): PluginOption {
    let inlineHeadScriptContent: string | undefined;
    return {
        name: 'vite-plugin-inline-head-script',
        async transformIndexHtml(): Promise<HtmlTagDescriptor[]>{
            const content = await getInlineScriptContent();
            return [
                {
                    tag: 'script',
                    children: content,
                    injectTo: 'head'
                }
            ];
        }
    };
    async function getInlineScriptContent(): Promise<string>{
        if(inlineHeadScriptContent === undefined){
            await build(inlineHeadScriptConfig);
            inlineHeadScriptContent = await readFile(inlineHeadScriptFilePath, {encoding: 'utf-8'});
        }
        return inlineHeadScriptContent;
    }
}
export default defineConfig({
    root: './src',
    plugins: [injectInlineHeadScript()]
})