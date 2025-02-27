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
    index: number,
    all: ThemeProps[]
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

const allLightThemeProps: ThemeProps[] = [
    {
        color: 'hsl(240 5% 80%)',
        backgroundColor: 'hsl(57 5% 85%)'
    },
    {
        color: 'hsl(240 5% 78%)',
        backgroundColor: 'hsl(57 5% 87%)'
    },
    {
        color: 'hsl(240 5% 72%)',
        backgroundColor: 'hsl(57 5% 92%)'
    },
    {
        color: 'hsl(240 5% 65%)',
        backgroundColor: 'hsl(57 5% 95%)'
    },
    {
        color: 'hsl(240 5% 45%)',
        backgroundColor: 'hsl(57 5% 95%)'
    },
    {
        color: 'hsl(240 5% 15%)',
        backgroundColor: 'hsl(57 5% 95%)'
    }
];

const allDarkThemeProps: ThemeProps[] = [
    {
        color: 'hsl(0 0 10%)',
        backgroundColor: 'hsl(0 0 5%)'
    },
    {
        color: 'hsl(0 0 12%)',
        backgroundColor: 'hsl(0 0 7%)'
    },
    {
        color: 'hsl(0 0 20%)',
        backgroundColor: 'hsl(0 0 9%)'
    },
    {
        color: 'hsl(0 0 30%)',
        backgroundColor: 'hsl(0 0 10%)'
    },
    {
        color: 'hsl(0 0 40%)',
        backgroundColor: 'hsl(0 0 10%)'
    },
    {
        color: 'hsl(0 0 60%)',
        backgroundColor: 'hsl(0 0 10%)'
    },
]

function getDarkThemeWinner({index, all}: ThemeDeterminingProps): ThemeDeterminingProps {
    return {all, index: Math.min(index + 1, allDarkThemeProps.length - 1)}
}

function getDarkThemeLoser({index, all}: ThemeDeterminingProps): ThemeDeterminingProps {
    return {all, index: Math.max(index - 1, 0)}
}

function getLightThemeWinner({index, all}: ThemeDeterminingProps): ThemeDeterminingProps {
    return {all, index: Math.min(index + 1, allLightThemeProps.length - 1)}
}

function getLightThemeLoser({index, all}: ThemeDeterminingProps): ThemeDeterminingProps {
    return {all, index: Math.max(index - 1, 0)}
}

function determineThemeProps({all, index}: ThemeDeterminingProps): ThemeProps {
    return all[index];
}

export const lightTheme = new SequenceTheme(
    {all: allLightThemeProps, index: 5},
    determineThemeProps,
    getLightThemeWinner,
    getLightThemeLoser
);
export const darkTheme = new SequenceTheme(
    {all: allDarkThemeProps, index: 5},
    determineThemeProps,
    getDarkThemeWinner,
    getDarkThemeLoser
)