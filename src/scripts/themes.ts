interface ThemeProps {
    readonly backgroundColor: string
    readonly color: string
    readonly lineDash: number[] | undefined
}

export interface Theme extends ThemeProps {
    readonly loserTheme: Theme
    readonly winnerTheme: Theme
}

class SequenceTheme implements Theme {
    public get backgroundColor(){return this.props.backgroundColor;}
    public get color(){return this.props.color;}
    public get lineDash(){return this.props.lineDash;}
    private cachedWinner: Theme | undefined;
    private cachedLoser: Theme | undefined;
    public get winnerTheme(): Theme {
        return this.cachedWinner = this.cachedWinner || this.createWinnerTheme();
    }
    public get loserTheme(): Theme {
        return this.cachedLoser = this.cachedLoser || this.createLoserTheme();
    }
    public constructor(
        private readonly props: ThemeProps,
        private readonly createWinner: (props: ThemeProps) => ThemeProps,
        private readonly createLoser: (props: ThemeProps) => ThemeProps
    ){}
    private createWinnerTheme(): SequenceTheme {
        return new SequenceTheme(this.createWinner(this.props), this.createWinner, this.createLoser);
    }
    private createLoserTheme(): SequenceTheme {
        return new SequenceTheme(this.createLoser(this.props), this.createWinner, this.createLoser);
    }
}
const loserLineDash: number[] = [4, 1];

const darkThemeProps: ThemeProps = {
    backgroundColor: `hsl(0 0 10%)`,
    color: `hsl(0 0 50%)`,
    lineDash: undefined
}

const lightThemeProps: ThemeProps = {
    backgroundColor: `hsl(57 5% 98%)`,
    color: '#151517',
    lineDash: undefined
}

function getDarkThemeWinner(): ThemeProps {
    return darkThemeProps;
}

function getDarkThemeLoser(): ThemeProps {
    return {...darkThemeProps, lineDash: loserLineDash};
}

function getLightThemeWinner(): ThemeProps {
    return lightThemeProps;
}

function getLightThemeLoser(): ThemeProps {
    return {...lightThemeProps, lineDash: loserLineDash};
}

export const lightTheme = new SequenceTheme(lightThemeProps, getLightThemeWinner, getLightThemeLoser);
export const darkTheme = new SequenceTheme(darkThemeProps, getDarkThemeWinner, getDarkThemeLoser)