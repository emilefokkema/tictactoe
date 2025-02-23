interface ThemeProps {
    readonly backgroundColor: string
    readonly color: string
}

interface Hsl {
    h: number
    s: number
    l: number
}

interface ThemeDeterminingProps {
    backgroundColor: Hsl
    color: Hsl
}

export interface Theme extends ThemeProps {
    readonly loserTheme: Theme
    readonly winnerTheme: Theme
}

class SequenceTheme implements Theme {
    private readonly props: ThemeProps;
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
        private readonly determiningProps: ThemeDeterminingProps,
        private readonly determine: (props: ThemeDeterminingProps) => ThemeProps,
        private readonly createWinner: (props: ThemeDeterminingProps) => ThemeDeterminingProps,
        private readonly createLoser: (props: ThemeDeterminingProps) => ThemeDeterminingProps
    ){
        this.props = determine(determiningProps);
    }
    private createWinnerTheme(): SequenceTheme {
        return new SequenceTheme(
            this.createWinner(this.determiningProps),
            this.determine,
            this.createWinner,
            this.createLoser);
    }
    private createLoserTheme(): SequenceTheme {
        return new SequenceTheme(
            this.createLoser(this.determiningProps),
            this.determine,
            this.createWinner,
            this.createLoser
        );
    }
}

const darkThemeProps: ThemeDeterminingProps = {
    backgroundColor: {h: 0, s: 0, l: 10},
    color: {h: 0, s: 0, l: 50}
}

const lightThemeProps: ThemeDeterminingProps = {
    backgroundColor: {h: 57, s: 5, l: 98},
    color: {h: 240, s: 5, l: 9}
}

function getDarkThemeWinner(): ThemeDeterminingProps {
    return darkThemeProps;
}

function getDarkThemeLoser(): ThemeDeterminingProps {
    return darkThemeProps;
}

function getLightThemeWinner(): ThemeDeterminingProps {
    return lightThemeProps;
}

function getLightThemeLoser(): ThemeDeterminingProps {
    return lightThemeProps;
}

function determineColor({h, s, l}: Hsl): string {
    return `hsl(${h} ${s}% ${l}%)`
}

function determineThemeProps({backgroundColor, color}: ThemeDeterminingProps): ThemeProps {
    return {
        color: determineColor(color),
        backgroundColor: determineColor(backgroundColor)
    }
}

export const lightTheme = new SequenceTheme(lightThemeProps, determineThemeProps, getLightThemeWinner, getLightThemeLoser);
export const darkTheme = new SequenceTheme(darkThemeProps, determineThemeProps, getDarkThemeWinner, getDarkThemeLoser)