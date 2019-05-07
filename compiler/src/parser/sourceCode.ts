export class SourceCode {
    public readonly source: string

    private _currentIndex = 0
    private _lineLength = 0
    private _lineData: number[] = []

    get currentIndex(): number {
        return this._currentIndex
    }
    get lineData(): number[] {
        return this._lineData
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

    peekCharMulti(lookAhead = 1): string {
        return this.source[this._currentIndex + lookAhead - 1]
    }

    nextChar(nextAmount = 1): string {
        const nextChar = this.source[this._currentIndex]
        if (nextChar === "\n") {
            this._lineData.push(this._lineLength)
            this._lineLength = 0
        } else {
            this._lineLength += nextAmount
        }
        this._currentIndex += nextAmount
        return nextChar
    }

    getTextSegment(start: number, end: number): string {
        return this.source.slice(start, end)
    }

    getLineInfo(location: number) {
        const lineRanges = []
        let counter = 0
        for (let i = 0; i < this._lineData.length; i++) {
            const lineItem = this._lineData[i]
            lineRanges.push({ line: i + 1, min: counter, max: counter + lineItem })
            counter = counter + lineItem + 1
        }
        lineRanges[0].min = 0
        // console.log(lineRanges)

        let tempCounter = 0;
        // for (const range of lineRanges) {
        //     tempCounter++
        //     if (location >= range.min && location <= range.max) {
        //         console.log("lines parsed:", tempCounter)
        //         const column = location % range.min + 1
        //         return { line: range.line, column: column }
        //     }
        // }

        let index = Math.floor(lineRanges.length / 2)
        let minIndex = 0
        let maxIndex = lineRanges.length - 1
        for (let i = 0; i < lineRanges.length; i++) {
            tempCounter++
            // console.log(i, index)
            const range = lineRanges[index]
            if (location >= range.min && location <= range.max) {
                // console.log("lines parsed:", tempCounter)
                const column = location % range.min + 1
                return { line: range.line, column: column }
            } else if (location < range.min) {
                maxIndex = range.line - 1
                index = Math.floor((minIndex + maxIndex) / 2)
            } else {
                minIndex = range.line - 1
                index = Math.floor((minIndex + maxIndex) / 2)
            }
        }
        throw new Error(`invalid source code location '${location}'`)
    }
}
