import * as fs from "fs"
import { LexicalAnalyzer } from "./parser/lexicalAnalyzer";
import { RiscVParser } from "./parser/riscVParser";
import { SourceCode } from "./parser/sourceCode";
import { Runner } from "./runner";

const source = fs.readFileSync("C:/gitbase/Tools/riscv/compiler/test.riscv").toString()
const sourceCode = new SourceCode(source)
const lexicalAnalyzer = new LexicalAnalyzer(sourceCode)
const syntaxTokens = lexicalAnalyzer.analyze()
const riscVCompiler = new RiscVParser(syntaxTokens)
const compilation = riscVCompiler.parse()
const runner = new Runner(compilation)
const execution = runner.run()

console.log(compilation)
console.log(execution)
// console.log(execution.registers.registers.slice(0, 10))
// console.log(execution.memory)
