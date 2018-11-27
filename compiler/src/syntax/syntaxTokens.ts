import { Token, SyntaxKind } from "./token";

export class SyntaxTokens {
    private readonly syntaxTokens: Token[]

    private currentIndex = 0

    constructor(syntaxTokens: Token[]) {
        this.syntaxTokens = syntaxTokens
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
            const expectedTokenKindText = SyntaxKind[expectedTokenKind]
            throw new Error(`Expected '${expectedTokenKindText}', but was actually '${currentToken.kindText}'`)
        }
        this.currentIndex++
        return currentToken
    }
}
