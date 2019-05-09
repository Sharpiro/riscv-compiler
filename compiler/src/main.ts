import * as fs from "fs"
import { LexicalAnalyzer } from "./parser/lexicalAnalyzer";
import { RiscVParser } from "./parser/riscVParser";
import { SourceCode } from "./parser/sourceCode";
import { Runner, CompilationError, Snapshot } from "./runner";
import { prettyPrint, redError } from "./functions";

const source = fs.readFileSync("test.riscv").toString()
const sourceCode = new SourceCode(source)
const lexicalAnalyzer = new LexicalAnalyzer(sourceCode)
const syntaxTokens = lexicalAnalyzer.analyze()

const riscVCompiler = new RiscVParser(syntaxTokens)
const compilation = riscVCompiler.parse()

let snapshots: Snapshot[] = []
try {
    const runner = new Runner(compilation, sourceCode)
    snapshots = runner.run()

    for (const snapshot of snapshots) {
        prettyPrint(snapshot.registers.registers, "registers")
        prettyPrint(Array.from(snapshot.memory), "memory")
        console.log()
    }
    console.log("return:", snapshots[snapshots.length - 1].registers.getByName("a0"))
}
catch (err) {
    if (err.name == CompilationError.name) {
        redError(err.message)
    } else {
        throw err
    }
}
