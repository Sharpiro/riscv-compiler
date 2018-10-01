import { SourceCode } from "./sourceCode";

export class CLangCompiler {
    sourceCode: SourceCode

    constructor(public readonly source: string) {
        this.sourceCode = new SourceCode(source)
    }

    compile(): void {

    }

    private parseStatement() {

    }


    private parseDeclarationStatement() {

    }

    private parseExpressionStatement() {

    }
}
