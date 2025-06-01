import type { PluginOption } from "vite"
import type { Readable } from "stream"
import { createIcon } from "../src/scripts/assets/create-icon"
import { faviconFileName, ogImageFileName, pwaIcon1, pwaIcon2 } from "./constants"
import { createPngIcon } from "../src/scripts/assets/create-png-icon"

export interface DynamicAsset {
    fileName: string
    contentType: string
    getContent: () => string | Readable
}

const dynamicAssets: DynamicAsset[] = [
    {
        fileName: faviconFileName,
        contentType: 'image/svg+xml',
        getContent(){return createIcon();}
    },
    {
        fileName: ogImageFileName,
        contentType: 'image/png',
        getContent() {
            return createPngIcon(600);
        },
    },
    {
        fileName: pwaIcon1,
        contentType: 'image/png',
        getContent() {
            return createPngIcon(192);
        },
    },
    {
        fileName: pwaIcon2,
        contentType: 'image/png',
        getContent() {
            return createPngIcon(512);
        },
    }
]

function addDynamicAssets(assets: DynamicAsset[]): PluginOption[] {
    

    return [
        {
            name: 'vite-plugin-serve-dynamic-assets',
            apply: 'serve',
            configureServer(server){
                server.middlewares.use((req, res, next) => {
                    const match = (req.url || '').match(/^\/([^/]*)$/);
                    if(!match){
                        next();
                        return;
                    }
                    const asset = assets.find((asset) => asset.fileName === match[1]);
                    if(!asset){
                        next();
                        return;
                    }
                    const content = asset.getContent();
                    res.setHeader('Content-Type', asset.contentType);
                    if(typeof content === 'string'){
                        res.write(content);
                        res.end();
                    }else{
                        content.pipe(res);
                    }
                })
            }
        },
        {
            name: 'vite-plugin-emit-dynamic-assets',
            apply: 'build',
            async buildEnd(){
                for(const asset of assets){
                    const content = asset.getContent();
                    if(typeof content === 'string'){
                        this.emitFile({
                            type: 'asset',
                            source: content,
                            fileName: asset.fileName
                        })
                    }else{
                        const buffer = await new Response(content).arrayBuffer();
                        this.emitFile({
                            type: 'asset',
                            source: new Uint8Array(buffer),
                            fileName: asset.fileName
                        })
                    }
                }
            }
        }
    ]
}

const addThem = () => addDynamicAssets(dynamicAssets)

export { addThem as addDynamicAssets }