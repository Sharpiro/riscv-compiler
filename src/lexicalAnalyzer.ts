import { SourceCode } from "./sourceCode";

export class TriviaList {
    trivia: Trivia[]
    fullSpan: TextSpan

    constructor(trivia: Trivia[]) {
        this.trivia = trivia

        const startingTrivia = trivia[0]
        const startingTriviaIndex = startingTrivia ? startingTrivia.fullSpan.start : 0
        const endingTrivia = trivia[trivia.length - 1]
        const endingTriviaIndex = endingTrivia ? endingTrivia.fullSpan.end : 0
        this.fullSpan = new TextSpan(startingTriviaIndex, endingTriviaIndex)
    }
}

export class Token {
    span: TextSpan
    fullSpan: TextSpan
    leadingTrivia: TriviaList
    trailingTrivia: TriviaList
    kind: TokenKind
    sourceCode: SourceCode

    get value(): string {
        return this.sourceCode.getSegment(this.span.start, this.span.end)
    }

    constructor(span: TextSpan, kind: TokenKind, sourceCode: SourceCode)
    constructor(span: TextSpan, kind: TokenKind, sourceCode: SourceCode, leadingTrivia: Trivia[],
        trailingTrivia: Trivia[])
    constructor(span: TextSpan, kind: TokenKind, sourceCode: SourceCode, leadingTrivia: Trivia[] = [],
        trailingTrivia: Trivia[] = []) {
        this.span = span
        this.leadingTrivia = new TriviaList(leadingTrivia)
        this.trailingTrivia = new TriviaList(trailingTrivia)
        this.kind = kind
        this.sourceCode = sourceCode

        const leadingIndex = Math.min(this.span.start, this.leadingTrivia.fullSpan.start)
        const trailingIndex = Math.min(this.span.end, this.trailingTrivia.fullSpan.end)
        this.fullSpan = new TextSpan(leadingIndex, trailingIndex)
    }
}

export class Trivia {
    readonly fullSpan: TextSpan
    readonly sourceCode: SourceCode
    readonly kind: string

    get value(): string {
        return this.sourceCode.getSegment(this.fullSpan.start, this.fullSpan.end)
    }

    constructor(fullspan: TextSpan, sourceCode: SourceCode, kind: "whitespaceTrivia" | "endOfLineTrivia") {
        this.fullSpan = fullspan
        this.sourceCode = sourceCode
        this.kind = kind
    }
}

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

export class LexicalAnalyzer {
    private readonly sourceCode: SourceCode
    private readonly whitespace = " "
    private readonly endOfLineTrivia = "\n"

    constructor(sourceCode: SourceCode) {
        this.sourceCode = sourceCode
    }

    analyze(): void {
        // while (this.sourceCode.hasNext) {
        const tokens = [] as Token[]
        for (let i = 0; i < 2; i++) {
            const token = this.analyzeToken()
            tokens.push(token)
        }
    }

    private analyzeToken(): Token {
        const leadingTrivia = this.analyzeTrivia()
        const token = this.parseToken()
        const trailingTrivia = this.analyzeTrivia()
        token.leadingTrivia = leadingTrivia
        token.trailingTrivia = trailingTrivia
        return token
    }

    private analyzeTrivia(): Trivia[] {
        const trivia = [] as Trivia[]
        const whitespaceTrivia = this.analyzeWhitespaceTrivia()
        const endOfLineTrivia = this.analyzeNewLineTrivia()

        if (whitespaceTrivia) trivia.push(whitespaceTrivia)
        if (endOfLineTrivia) trivia.push(endOfLineTrivia)

        return trivia
    }

    private analyzeWhitespaceTrivia(): Trivia | null {
        if (this.sourceCode.peekChar !== this.whitespace) return null

        const startIndex = this.sourceCode.currentIndex
        let endIndex = startIndex
        while (this.sourceCode.peekChar === this.whitespace) {
            this.sourceCode.nextChar()
            endIndex++
        }

        const span = new TextSpan(startIndex, endIndex)
        return new Trivia(span, this.sourceCode, "whitespaceTrivia")
    }

    private analyzeNewLineTrivia(): Trivia | null {
        const currentChar = this.sourceCode.peekChar
        if (currentChar !== this.endOfLineTrivia) return null

        const startIndex = this.sourceCode.currentIndex
        const span = new TextSpan(startIndex, startIndex + 1)
        this.sourceCode.nextChar()
        return new Trivia(span, this.sourceCode, "endOfLineTrivia")
    }

    private parseToken(): Token {
        const peekChar = this.sourceCode.peekChar

        let span: TextSpan
        let tokenKind: TokenKind
        switch (peekChar) {
            case ":":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = TokenKind.SemicolonToken
                this.sourceCode.nextChar()
                break
            default:
                const identifierSpan = this.parseIdentifier()
                if (identifierSpan === null) {
                    throw new Error(`invalid character '${peekChar}' while parsing token`)
                }
                span = identifierSpan
                tokenKind = TokenKind.Identifier
        }

        const token = new Token(span, tokenKind, this.sourceCode)
        return token
    }

    private parseIdentifier(): TextSpan | null {
        const lowLimit = "a".charCodeAt(0)
        const highLimit = "z".charCodeAt(0)

        let peekChar = this.sourceCode.peekChar
        let peekCharCode = peekChar.charCodeAt(0)

        if (peekCharCode < lowLimit || peekCharCode > highLimit) return null

        let currentChar = peekChar
        let currentCharCode = peekCharCode

        const startIndex = this.sourceCode.currentIndex
        let endIndex = startIndex
        while (peekCharCode >= lowLimit && peekCharCode <= highLimit) {
            currentChar = this.sourceCode.nextChar()
            currentCharCode = currentChar.charCodeAt(0)
            peekChar = this.sourceCode.peekChar
            peekCharCode = peekChar.charCodeAt(0)
            endIndex++
        }

        const span = new TextSpan(startIndex, endIndex)
        return span
        // return new Token(span, TokenKind.Identifier)
    }
}

export enum TokenKind {
    Identifier,
    SemicolonToken
}
