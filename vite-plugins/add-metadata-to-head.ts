import { type PluginOption, type ViteDevServer } from 'vite'
import translations from '../src/translations.json'
import { faviconFileName, ogImageFileName } from './constants';

type Language = keyof typeof translations;
export function addMetadataToHead(): PluginOption {
    let publicBase: string | undefined;
    let devServer: ViteDevServer | undefined;
    let baseUrl: string | undefined;
    return {
        name: 'vite-plugin-add-head-metadata',
        configResolved(config) {
            publicBase = config.base;
        },
        configureServer(server){
            devServer = server;
        },
        async transformIndexHtml(_, ctx){
            const language = getLanguage(ctx.filename);
            const { title, explanation } = translations[language];
            return [
		        {
                    tag: 'meta',
                    attrs: {
                        charset: 'utf-8'
                    },
                    injectTo: 'head-prepend'
                },
		        {
                    tag: 'meta',
                    attrs: {
                        name: 'viewport',
                        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'mobile-web-app-capable',
                        content: 'yes'
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                                name: 'theme-color',
                                value: '#333'
                            },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'icon',
                        href: getFullAssetUrl(faviconFileName),
                        sizes: 'any'
                    }
                },
		        {
                    tag: 'link',
                    attrs: {
                        rel: 'manifest',
                        href: '/manifest.json',
                    }
                },
                {
                    tag: 'title',
                    children: title,
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:title',
                        content: title
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:description',
                        content: explanation
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image',
                        content: getFullAssetUrl(ogImageFileName)
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image:width',
                        content: '600'
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image:height',
                        content: '600'
                    },
                    injectTo: 'head-prepend'
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image:type',
                        content: 'image/png'
                    },
                    injectTo: 'head-prepend'
                },
                ...getOtherLanguages(language).map(l => ({
                    tag: 'link',
                    attrs: {
                        rel: 'alternate',
                        hreflang: l,
                        href: getAlternateLanguageUrl(l)
                    }
                }))
            ]
        }
    };
    function getFullAssetUrl(assetFileName: string): string {
        return new URL(`${publicBase}${assetFileName}`, getBaseUrl()).toString();
    }
    function calculateBaseUrl(): string {
        if(!devServer){
            return 'https://tictactoemap.com'
        }
        const resolvedUrls = devServer.resolvedUrls;
        if(!resolvedUrls){
            throw new Error('dev server should have resolved urls now')
        }
        const networkResolvedUrls = resolvedUrls.network;
        if(networkResolvedUrls.length > 0){
            return networkResolvedUrls[0];
        }
        const localResolvedUrls = resolvedUrls.local;
        if(localResolvedUrls.length === 0){
            throw new Error('no local resolved url found on dev server')
        }
        return localResolvedUrls[0];
    }
    function getBaseUrl(): string {
        return baseUrl || (baseUrl = calculateBaseUrl());
    }
    function getLanguage(indexHtmlFileName: string): keyof typeof translations{
        const match = indexHtmlFileName.match(/(?:\/(\w{2})\/)index\.html$/);
        if(!match){
            return 'en'
        }
        return match[1] as keyof typeof translations
    }
    function getAlternateLanguageUrl(language: Language): string {
        if(language === 'en'){
            return new URL(`${publicBase}`, getBaseUrl()).toString();
        }
        return new URL(`${publicBase}${language}/`, getBaseUrl()).toString();
    }
    function getOtherLanguages(language: Language): Language[] {
        return (['en', 'de', 'fr', 'nl'] as const).filter(l => l !== language);
    }
}