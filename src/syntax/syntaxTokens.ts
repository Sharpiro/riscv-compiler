import { Token, TokenKind } from "./token";

export class SyntaxTokens {
    private readonly syntaxTokens: Token[]

    private currentIndex = 0

    constructor(syntaxTokens: Token[]) {
        this.syntaxTokens = syntaxTokens
    }

    get peekToken(): Token {
        return this.syntaxTokens[this.currentIndex]
    }

    eatToken(expectedTokenKind: TokenKind): Token {
        const currentToken = this.syntaxTokens[this.currentIndex]
        if (currentToken.kind !== expectedTokenKind) {
            const expectedTokenKindText = TokenKind[expectedTokenKind]
            throw new Error(`Expected '${expectedTokenKindText}', but was actually '${currentToken.kindText}'`)
        }
        this.currentIndex++
        return currentToken
    }
}