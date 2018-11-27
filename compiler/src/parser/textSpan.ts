export class TextSpan {
    start: number
    end: number

    constructor()
    constructor(start: number, end: number)
    constructor(start = 0, end = 0) {
        this.start = start
        this.end = end
    }

    get length(): number {
        return this.end - this.start
    }
}
