export class SourceCode {
    private _currentLine = 1
    private _currentColumn = 1

    currentIndex = 0

    get currentLine(): number {
        return this._currentLine
    }
    get currentColumn(): number {
        return this._currentColumn
    }

    constructor(public source: string) { }

    peekChar(): string {
        return this.source[this.currentIndex]
    }

    nextChar(): string {
        const nextChar = this.source[this.currentIndex]
        if (nextChar == "\n") {
            this._currentLine++
            this._currentColumn = 1
        }
        else {
            this._currentColumn++
        }
        this.currentIndex++
        return nextChar
    }
}
