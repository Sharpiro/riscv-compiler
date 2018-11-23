import { SourceCode } from "./sourceCode";
import { TextSpan } from "./textSpan";
import { Token, SyntaxKind } from "../syntax/token";
import { Trivia } from "../syntax/trivia";
import { SyntaxTokens } from "../syntax/syntaxTokens";

export class LexicalAnalyzer {
    private readonly sourceCode: SourceCode
    private readonly whitespace = " "
    private readonly endOfLineTrivia = "\n"

    constructor(sourceCode: SourceCode) {
        this.sourceCode = sourceCode
    }

    analyze(): SyntaxTokens {
        const tokens = [] as Token[]
        while (this.sourceCode.hasNext) {
            const token = this.analyzeTokenAndTrivia()
            tokens.push(token)
        }
        return new SyntaxTokens(tokens)
    }

    private analyzeTokenAndTrivia(): Token {
        const leadingTrivia = this.analyzeTrivia()
        let token = this.analyzeToken()
        const trailingTrivia = this.analyzeTrivia()
        token = token
            .withLeadingTrivia(leadingTrivia)
            .withTrailingTrivia(trailingTrivia)
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

    private analyzeToken(): Token {
        const peekChar = this.sourceCode.peekChar

        let span: TextSpan
        let tokenKind: SyntaxKind
        switch (peekChar) {
            case ":":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = SyntaxKind.SemicolonToken
                this.sourceCode.nextChar()
                break
            case ",":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = SyntaxKind.Comma
                this.sourceCode.nextChar()
                break
            case "-":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = SyntaxKind.MinusToken
                this.sourceCode.nextChar()
                break
            case "(":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = SyntaxKind.OpenParen
                this.sourceCode.nextChar()
                break
            case ")":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = SyntaxKind.CloseParen
                this.sourceCode.nextChar()
                break
            case "\0":
                span = new TextSpan(this.sourceCode.currentIndex, this.sourceCode.currentIndex + 1)
                tokenKind = SyntaxKind.EndOfFile
                this.sourceCode.nextChar()
                break
            default:
                let parsedSpan = this.parseSpan(this.isValidNumericConstant)
                tokenKind = SyntaxKind.NumericLiteral
                if (parsedSpan === null) {
                    parsedSpan = this.parseSpan(this.isValidIdentifier)
                    tokenKind = SyntaxKind.Identifier
                }
                if (parsedSpan === null) {
                    throw new Error(`invalid character '${peekChar}' while parsing token`)
                }
                span = parsedSpan
        }

        const token = new Token(span, tokenKind, this.sourceCode)
        return token
    }

    private parseSpan(validCharacterFunction: (charChode: number) => boolean): TextSpan | null {
        let peekChar = this.sourceCode.peekChar
        let peekCharCode = peekChar.charCodeAt(0)

        if (!validCharacterFunction(peekCharCode)) return null

        let currentChar = peekChar
        let currentCharCode = peekCharCode

        const startIndex = this.sourceCode.currentIndex
        let endIndex = startIndex
        while (validCharacterFunction(peekCharCode)) {
            currentChar = this.sourceCode.nextChar()
            currentCharCode = currentChar.charCodeAt(0)
            peekChar = this.sourceCode.peekChar
            peekCharCode = peekChar.charCodeAt(0)
            endIndex++
        }

        const span = new TextSpan(startIndex, endIndex)
        return span
    }

    private isValidIdentifier(characterCode: number): boolean {
        const lowLetterLimit = "a".charCodeAt(0)
        const highLetterLimit = "z".charCodeAt(0)

        const lowNumberLimit = "0".charCodeAt(0)
        const highNumberLimit = "9".charCodeAt(0)

        if (characterCode >= lowNumberLimit && characterCode <= highNumberLimit) return true
        if (characterCode >= lowLetterLimit && characterCode <= highLetterLimit) return true

        return false
    }

    private isValidNumericConstant(characterCode: number): boolean {
        const lowNumberLimit = "0".charCodeAt(0)
        const highNumberLimit = "9".charCodeAt(0)

        return characterCode >= lowNumberLimit &&
            characterCode <= highNumberLimit
    }
}
