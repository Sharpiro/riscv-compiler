import { SourceCode } from "../parser/sourceCode";
import { TextSpan } from "../parser/textSpan";

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
