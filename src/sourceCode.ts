export class SourceCode {
    public readonly source: string

    private _currentIndex = 0
    private _currentLine = 1
    private _currentColumn = 1

    get currentIndex(): number {
        return this._currentIndex
    }
    get currentLine(): number {
        return this._currentLine
    }
    get currentColumn(): number {
        return this._currentColumn
    }

    get peekChar(): string {
        return this.source[this._currentIndex]
    }

    get hasNext(): boolean {
        return this._currentIndex < this.source.length
    }

    constructor(source: string) {
        this.source = source.replace(/\r/g, "")
        this.source = this.source + "\0"
    }

    nextChar(): string {
        const nextChar = this.source[this._currentIndex]
        if (nextChar === "\n") {
            this._currentLine++
            this._currentColumn = 1
        } else {
            this._currentColumn++
        }
        this._currentIndex++
        return nextChar
    }

    getSegment(start: number, end: number): string {
        return this.source.slice(start, end)
    }
}
