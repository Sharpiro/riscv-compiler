import { SourceCode } from "./sourceCode";

export class Token {
    span = new Span()
    fullSpan = new Span()
    leadingTrivia = [] as Trivia[]
    trailingTrivia = [] as Trivia[]
}

export class Trivia {
    readonly fullspan: Span
    readonly sourceCode: SourceCode
    readonly kind: string

    get value(): string {
        return this.sourceCode.getSegment(this.fullspan.start, this.fullspan.end)
    }

    constructor(fullspan: Span, sourceCode: SourceCode, kind: string) {
        this.fullspan = fullspan
        this.sourceCode = sourceCode
        this.kind = kind
    }
}

export class Span {
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

export class LexicalAnalyzer {
    private readonly sourceCode: SourceCode
    private readonly whitespace = " "

    constructor(sourceCode: SourceCode) {
        this.sourceCode = sourceCode
    }

    analyze(): void {
        const token = this.analyzeToken()
    }

    private analyzeToken(): Token {
        const leadingTrivia = this.analyzeWhitespace()
        const tokenText = "abc123"
        const trailingTrivia = this.analyzeWhitespace()
        const token = new Token()
        return token
    }

    private analyzeWhitespace(): Trivia | null {
        const startIndex = this.sourceCode.currentIndex
        let endIndex = startIndex
        while (this.sourceCode.peekChar() === this.whitespace) {
            this.sourceCode.nextChar()
            endIndex++
        }

        const span = new Span(startIndex, endIndex)
        return new Trivia(span, this.sourceCode, "whatever")
    }

    private parseToken(): string {
        let token = ""
        while (true) {
            const currentChar = this.sourceCode.peekChar()
            if (currentChar === " " || currentChar === "\n" || currentChar === ","
                || currentChar === ":") {
                return token
            }
            token += this.sourceCode.nextChar()
        }
    }
}
