interface ThemeProps {
    readonly backgroundColor: string
    readonly color: string
}

export interface Theme extends ThemeProps {
    readonly loserTheme: Theme
    readonly winnerTheme: Theme
}

class SequenceTheme implements Theme {
    public get backgroundColor(){return this.props.backgroundColor;}
    public get color(){return this.props.color;}
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
}

const lightThemeProps: ThemeProps = {
    backgroundColor: `hsl(57 5% 98%)`,
    color: '#151517',
}

function getDarkThemeWinner(): ThemeProps {
    return darkThemeProps;
}

function getDarkThemeLoser(): ThemeProps {
    return darkThemeProps;
}

function getLightThemeWinner(): ThemeProps {
    return lightThemeProps;
}

function getLightThemeLoser(): ThemeProps {
    return lightThemeProps;
}

export const lightTheme = new SequenceTheme(lightThemeProps, getLightThemeWinner, getLightThemeLoser);
export const darkTheme = new SequenceTheme(darkThemeProps, getDarkThemeWinner, getDarkThemeLoser)