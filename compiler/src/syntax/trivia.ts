import { SourceCode } from "../parser/sourceCode";
import { TextSpan } from "../parser/textSpan";
import { SyntaxKind } from "./token";

export class Trivia {
    readonly fullSpan: TextSpan
    readonly sourceCode: SourceCode
    readonly kind: SyntaxKind

    get kindText(): string {
        return SyntaxKind[this.kind]
    }

    get valueText(): string {
        return this.sourceCode.getSegment(this.fullSpan.start, this.fullSpan.end)
    }

    constructor(fullspan: TextSpan, sourceCode: SourceCode, kind: SyntaxKind) {
        this.fullSpan = fullspan
        this.sourceCode = sourceCode
        this.kind = kind
    }
}
