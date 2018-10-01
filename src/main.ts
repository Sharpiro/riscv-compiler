import { RiscVCompiler } from "./riscVCompiler";
import { Runner } from "./runner";

// const cppSource = "int x = 2 + 3;"

// const cCompiler = new CLangCompiler(cppSource)
// cCompiler.compile()

const source =
    `addi x5, x0, 5
sd x5, 16(x1)`
const riscVCompiler = new RiscVCompiler(source)
const commands = riscVCompiler.compile()
const runner = new Runner(commands)
runner.run()

// console.log(commands)
// console.log(runner.registers.registers.slice(0, 5))

// function run(commands: CommandSyntax[]) {

// }

// function add() {
//     const targetRegister: number
//     const sourceRegister1: number
//     const sourceRegister2: number
//     registers[targetRegister] = registers[sourceRegister1] + registers[sourceRegister2]
// }
