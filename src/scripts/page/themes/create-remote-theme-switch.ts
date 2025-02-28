import { EventDispatcher } from "../events/event-dispatcher";
import type { RemoteThemeSwitch, RemoteThemeSwitchEventMap } from "./remote-theme-switch";
import type { ThemeVariant } from "./theme-variant";

interface ThemeChangeMessage {
    type: 'themechange',
    data: ThemeVariant
}

function isThemeChangeMessage(value: unknown): value is ThemeChangeMessage {
    const asMessage = value as ThemeChangeMessage;
    return !!asMessage && asMessage.type === 'themechange' && (asMessage.data === 'light' || asMessage.data === 'dark');
}
export function createRemoteThemeSwitch(channel: BroadcastChannel): RemoteThemeSwitch {
    const eventDispatcher: EventDispatcher<RemoteThemeSwitchEventMap> = new EventDispatcher({change: []});

    channel.addEventListener('message', (e) => {
        const data = e.data;
        if(!data || !isThemeChangeMessage(data)){
            return;
        }
        eventDispatcher.dispatchEvent('change', {theme: data.data});
    });

    return {
        setTheme(theme: ThemeVariant): void{
            channel.postMessage({
                type: 'themechange',
                data: theme
            })
        },
        addEventListener(type, handler) {
            eventDispatcher.addEventListener(type, handler);
        },
        removeEventListener(type, handler) {
            eventDispatcher.removeEventListener(type, handler);
        },
    }
}