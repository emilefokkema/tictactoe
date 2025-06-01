import { fileURLToPath } from 'url';
import path from 'path';

export const inlineHeadScriptOutDir = fileURLToPath(new URL('../dist-inline-head-script', import.meta.url));
export const inlineHeadScriptFilePath = path.resolve(inlineHeadScriptOutDir, 'index.iife.js');
export const faviconFileName = 'favicon.svg';
export const ogImageFileName = 'og-image.png';
export const pwaIcon1 = 'icon-192.png';
export const pwaIcon2 = 'icon-512.png';