import { describe, beforeEach, it, expect, vi } from 'vitest'
import { ThemeSwitch } from '../src/scripts/page/themes/theme-switch';
import { createThemeSwitch } from '../src/scripts/page/themes/create-theme-switch'
import { ThemeAreaTracker } from '../src/scripts/page/themes/theme-area-tracker';
import { ThemePreference, ThemePreferencePersister } from '../src/scripts/page/themes/theme-preference-persister';
import { DarkThemePreferenceTracker } from '../src/scripts/page/themes/dark-theme-preference-tracker';
import { darkTheme, lightTheme } from '../src/scripts/page/themes/themes';
import { MockBroadcastChannel } from './mock-broadcast-channel';

describe('a theme switch', () => {
    const mockBroadcastChannel = new MockBroadcastChannel();
    let isOnPrimaryArea: boolean
    let prefersDarkTheme: boolean
    let notifyAreaChange: (e: {primary: boolean}) => void;
    let notifyDarkThemePreferenceChange: (e: {prefersDarkTheme: boolean}) => void;
    let persisted: ThemePreference;

    describe('that begins on primary area with a dark theme preference and nothing persisted', () => {
        let themeSwitch: ThemeSwitch;

        beforeEach(() => {
            isOnPrimaryArea = true;
            prefersDarkTheme = true;
            persisted = null;
            themeSwitch = createTestThemeSwitch();
        })

        it('should have the right themes', () => {
            expect(themeSwitch.primaryTheme).toBe(darkTheme);
            expect(themeSwitch.secondaryTheme).toBe(lightTheme)
        })

        describe('and then it switches to the secondary area', () => {

            beforeEach(() => {
                notifyAreaChange({primary: false});
            })

            it('should have the same themes', () => {
                expect(themeSwitch.primaryTheme).toBe(darkTheme);
                expect(themeSwitch.secondaryTheme).toBe(lightTheme)
            })

            it('should have persisted the preference', () => {
                expect(persisted).toBe('light')
            })

            describe('and then it switches back to the primary area', () => {

                beforeEach(() => {
                    notifyAreaChange({primary: true});
                })

                it('should have the same themes', () => {
                    expect(themeSwitch.primaryTheme).toBe(darkTheme);
                    expect(themeSwitch.secondaryTheme).toBe(lightTheme)
                })

                it('should have persisted the preference', () => {
                    expect(persisted).toBe(null)
                })
            })

            describe('and then it no longer prefers dark theme', () => {

                beforeEach(() => {
                    notifyDarkThemePreferenceChange({prefersDarkTheme: false})
                })

                it('should have the same themes', () => {
                    expect(themeSwitch.primaryTheme).toBe(darkTheme);
                    expect(themeSwitch.secondaryTheme).toBe(lightTheme)
                })

                it('should have persisted the preference', () => {
                    expect(persisted).toBe(null)
                })

                describe('and then it does prefer dark theme', () => {

                    beforeEach(() => {
                        notifyDarkThemePreferenceChange({prefersDarkTheme: true})
                    })

                    it('should have the themes reversed', () => {
                        expect(themeSwitch.primaryTheme).toBe(lightTheme);
                        expect(themeSwitch.secondaryTheme).toBe(darkTheme)
                    })
                })
            })
        })

        describe('and then it no longer prefers dark theme', () => {

            beforeEach(() => {
                notifyDarkThemePreferenceChange({prefersDarkTheme: false})
            })

            it('should have the themes reversed', () => {
                expect(themeSwitch.primaryTheme).toBe(lightTheme);
                expect(themeSwitch.secondaryTheme).toBe(darkTheme)
            })
        })

        describe('and then the theme is changed remotely', () => {

            beforeEach(() => {
                mockBroadcastChannel.messageHandler({
                    data: {
                        type: 'themechange',
                        data: 'light'
                    }
                } as MessageEvent)
            })

            it('should have the themes reversed', () => {
                expect(themeSwitch.primaryTheme).toBe(lightTheme);
                expect(themeSwitch.secondaryTheme).toBe(darkTheme)
            })
        })
    })

    describe('that begins on primary area with dark theme preference and light persisted', () => {
        let themeSwitch: ThemeSwitch;

        beforeEach(() => {
            isOnPrimaryArea = true;
            prefersDarkTheme = true;
            persisted = 'light';
            themeSwitch = createTestThemeSwitch();
        })

        it('should have the right themes', () => {
            expect(themeSwitch.primaryTheme).toBe(lightTheme);
            expect(themeSwitch.secondaryTheme).toBe(darkTheme)
        })
    })

    describe('that begins on primary area without dark theme preference and nothing persisted', () => {
        let themeSwitch: ThemeSwitch;

        beforeEach(() => {
            isOnPrimaryArea = true;
            prefersDarkTheme = false;
            persisted = null;
            themeSwitch = createTestThemeSwitch();
        })

        it('should have the right themes', () => {
            expect(themeSwitch.primaryTheme).toBe(lightTheme);
            expect(themeSwitch.secondaryTheme).toBe(darkTheme)
        })
    })

    function createTestThemeSwitch(): ThemeSwitch {
        const mockThemeAreaTracker: ThemeAreaTracker = {
            get primary(){return isOnPrimaryArea;},
            addEventListener(type, handler) {
                if(type === 'change'){
                    notifyAreaChange = handler;
                }
            },
            removeEventListener(){}
        };
        const persister: ThemePreferencePersister = {
            read(){return persisted;},
            persist(preference: ThemePreference): void{
                persisted = preference;
            }
        };
        const darkThemePreferenceTracker: DarkThemePreferenceTracker = {
            get prefersDarkTheme(){return prefersDarkTheme;},
            addEventListener(type, handler) {
                if(type === 'change'){
                    notifyDarkThemePreferenceChange = handler;
                }
            },
            removeEventListener(){}
        }
        return createThemeSwitch(
            mockThemeAreaTracker,
            persister,
            darkThemePreferenceTracker,
            mockBroadcastChannel
        )
    }
})