import * as fs from "fs"
import { LexicalAnalyzer } from "./lexicalAnalyzer";
import { RiscVCompiler } from "./riscVCompiler";
import { Runner } from "./runner";
import { SourceCode } from "./sourceCode";

const source = fs.readFileSync("C:/gitbase/Tools/riscv/test.riscv").toString()
const sourceCode = new SourceCode(source)
const lexicalAnalyzer = new LexicalAnalyzer(sourceCode)
const tokens = lexicalAnalyzer.analyze()
const riscVCompiler = new RiscVCompiler(sourceCode)
const compilation = riscVCompiler.compile()
const runner = new Runner(compilation)
const execution = runner.run()

// console.log(commands)
console.log(execution.registers.registers.slice(0, 10))
console.log(execution.memory)
