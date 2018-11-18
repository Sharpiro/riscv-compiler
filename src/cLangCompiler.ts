import { SourceCode } from "./parser/sourceCode";

export class CLangCompiler {
    sourceCode: SourceCode

    constructor(sourceCode: SourceCode) {
        this.sourceCode = sourceCode
    }

    compile(): void {
        throw new Error("not implemented")
    }

    private parseStatement() {
        throw new Error("not implemented")
    }

    private parseDeclarationStatement() {
        throw new Error("not implemented")
    }

    private parseExpressionStatement() {
        throw new Error("not implemented")
    }
}
