import * as fs from "fs"
import { LexicalAnalyzer } from "./parser/lexicalAnalyzer";
import { RiscVParser } from "./parser/riscVParser";
import { SourceCode } from "./parser/sourceCode";
import { Runner } from "./runner";
import { prettyPrint } from "./functions";

const source = fs.readFileSync("C:/gitbase/Tools/riscv/compiler/test.riscv").toString()
const sourceCode = new SourceCode(source)
const lexicalAnalyzer = new LexicalAnalyzer(sourceCode)
const syntaxTokens = lexicalAnalyzer.analyze()

const riscVCompiler = new RiscVParser(syntaxTokens)
const compilation = riscVCompiler.parse()
const runner = new Runner(compilation)
const executions = runner.run()

// console.log(compilation)
// console.log(execution.registers.registers)
// prettyPrint(sourceCode.lineData.slice(0, 50))
// console.log(syntaxTokens.syntaxTokens[0].span)
// console.log(sourceCode.getLineInfo(syntaxTokens.syntaxTokens[0].span.start))
// expected: { line: 9, column: 1 }
for (const execution of executions) {
    prettyPrint(execution.registers.registers, "registers")
    prettyPrint(Array.from(execution.memory), "memory")
    console.log()
}

