export interface Theme {
    readonly backgroundColor: string
    readonly color: string
    readonly loserTheme: Theme
    readonly winnerTheme: Theme
}

class DarkTheme implements Theme {
    public backgroundColor: string;
    public color: string;
    public constructor(){
        this.color = `hsl(0 0 50%)`;
        this.backgroundColor = `hsl(0 0 10%)`
    }
    public get winnerTheme(): Theme {
        return darkTheme;
    }
    public get loserTheme(): Theme {
        return darkTheme;
    }
}

class EverDarkerTheme implements Theme {
    public backgroundColor: string
    public color = '#151517';
    private cachedWinner: Theme | undefined;
    private cachedLoser: Theme | undefined;
    public get winnerTheme(): Theme {
        return this.cachedWinner = this.cachedWinner || this.createWinnerTheme();
    }
    public get loserTheme(): Theme {
        return this.cachedLoser = this.cachedLoser || this.createLoserTheme();
    }
    public constructor(
        private readonly lightness: number
    ){
        this.backgroundColor = `hsl(57 5 ${lightness})`;
    }
    private createLoserTheme(): Theme {
        const newLightness = Math.max(0, this.lightness - 10);
        return new EverDarkerTheme(newLightness);
    }
    private createWinnerTheme(): Theme {
        const newLightness = Math.min(98, this.lightness + 5);
        return new EverDarkerTheme(newLightness);
    }
}

export const lightTheme = new EverDarkerTheme(98);
export const darkTheme = new DarkTheme();