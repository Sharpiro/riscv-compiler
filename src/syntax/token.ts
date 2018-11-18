import { SourceCode } from "../parser/sourceCode";
import { TextSpan } from "../parser/textSpan";
import { Trivia } from "./trivia";
import { TriviaList } from "./triviaList";

export enum TokenKind {
    Identifier,
    SemicolonToken,
    Comma,
    UnaryOperator,
    LeftParen,
    RightParen,
    EndOfFile
}

export class Token {
    span: TextSpan
    fullSpan = new TextSpan()
    leadingTrivia = new TriviaList()
    trailingTrivia = new TriviaList()
    kind: TokenKind
    sourceCode: SourceCode

    get value(): string {
        return this.sourceCode.getSegment(this.span.start, this.span.end)
    }

    get valueFull(): string {
        return this.sourceCode.getSegment(this.fullSpan.start, this.fullSpan.end)
    }

    get kindText(): string {
        return TokenKind[this.kind]
    }

    constructor(span: TextSpan, kind: TokenKind, sourceCode: SourceCode)
    constructor(span: TextSpan, kind: TokenKind, sourceCode: SourceCode,
        leadingTrivia: Trivia[], trailingTrivia: Trivia[])
    constructor(span: TextSpan, kind: TokenKind, sourceCode: SourceCode,
        leadingTrivia: Trivia[] = [], trailingTrivia: Trivia[] = []) {
        this.span = span
        this.kind = kind
        this.sourceCode = sourceCode

        this.withLeadingTrivia(leadingTrivia)
        this.withTrailingTrivia(trailingTrivia)
        // this.leadingTrivia = new TriviaList(leadingTrivia)
        // this.trailingTrivia = new TriviaList(trailingTrivia)

        // const leadingIndex = Math.min(this.span.start, this.leadingTrivia.fullSpan.start)
        // const trailingIndex = Math.min(this.span.end, this.trailingTrivia.fullSpan.end)
        // this.fullSpan = new TextSpan(leadingIndex, trailingIndex)

    }

    withLeadingTrivia(leadingTrivia: Trivia[]): Token {
        this.leadingTrivia = new TriviaList(leadingTrivia)
        const leadingIndex = this.leadingTrivia.any ?
            Math.min(this.span.start, this.leadingTrivia.fullSpan.start) : this.span.start
        this.fullSpan = new TextSpan(leadingIndex, this.fullSpan.end)
        return this
    }

    withTrailingTrivia(trailingTrivia: Trivia[]): Token {
        this.trailingTrivia = new TriviaList(trailingTrivia)
        const trailingIndex = Math.max(this.span.end, this.trailingTrivia.fullSpan.end)
        this.fullSpan = new TextSpan(this.fullSpan.start, trailingIndex)
        return this
    }
}
