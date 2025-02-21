export class MockTheme {
    public constructor(
        private id = ''
    ){

    }
    public get winnerTheme(){return new MockTheme(`${this.id}+`)}
    public get loserTheme(){return new MockTheme(`${this.id}-`)}
    public toString(){
        return this.id;
    }
}