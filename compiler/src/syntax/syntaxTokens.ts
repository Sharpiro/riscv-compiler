import { Token, SyntaxKind } from "./token";
import { SourceCode } from "../parser/sourceCode";

export class SyntaxTokens {
    private currentIndex = 0

    constructor(
        readonly syntaxTokens: Token[],
        private readonly sourceCode: SourceCode) {
    }

    get hasNext(): boolean {
        return this.currentIndex < this.syntaxTokens.length
    }

    get peekToken(): Token {
        return this.syntaxTokens[this.currentIndex]
    }

    eatToken(expectedTokenKind?: SyntaxKind): Token {
        const currentToken = this.syntaxTokens[this.currentIndex]
        if (expectedTokenKind && currentToken.kind !== expectedTokenKind) {
            const lineInfo = this.sourceCode.getLineInfo(currentToken.span.start)
            const expectedTokenKindText = SyntaxKind[expectedTokenKind]
            throw new Error(`[${lineInfo.line}, ${lineInfo.column}, ` +
                `${currentToken.span.start}]: Expected '${expectedTokenKindText}' ` +
                `but was actually '${currentToken.kindText}'`)
        }
        this.currentIndex++
        return currentToken
    }
}
