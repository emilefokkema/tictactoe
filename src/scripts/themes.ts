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
        return this;
    }
    public get loserTheme(): Theme {
        return this;
    }
}

class LightTheme implements Theme {
    public backgroundColor: string
    public color = '#151517';
    public get winnerTheme(): Theme {
        return this;
    }
    public get loserTheme(): Theme {
        return this;
    }
    public constructor(
    ){
        this.backgroundColor = `hsl(57 5% 98%)`;
    }
}

export const lightTheme = new LightTheme();
export const darkTheme = new DarkTheme();