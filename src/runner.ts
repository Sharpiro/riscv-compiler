import { Command, AddCommand, AddImmediateCommand, StoreDoubleWordCommand } from "./addCommandSyntax";
import { Registers } from "./registers";
import { Buffer } from "buffer"

export class Runner {
    readonly registers = new Registers()
    readonly memory = new Buffer(24)

    constructor(public commands: Command[]) { }

    run(): void {
        for (const command of this.commands) {
            this.runCommand(command)
        }
    }

    private runCommand(command: Command): void {
        switch (command.name) {
            case "add":
                this.runAddCommand(command as AddCommand)
                break
            case "addi":
                this.runAddImmediateCommand(command as AddImmediateCommand)
                break
            case "sd":
                this.runStoreDoubleWordCommand(command as StoreDoubleWordCommand)
                break
            default:
                throw new Error(`invalid command '${command.name}'`)
        }
    }

    private runAddCommand(command: AddCommand): void {
        const valueOne = this.registers.get(command.sourceRegisterOne)
        const valueTwo = this.registers.get(command.sourceRegisterTwo)
        const result = valueOne + valueTwo
        this.registers.set(command.destinationRegister, result)
    }

    private runAddImmediateCommand(command: AddImmediateCommand): void {
        const valueOne = this.registers.get(command.sourceRegisterOne)
        const result = valueOne + command.constantValue
        this.registers.set(command.destinationRegister, result)
    }

    private runStoreDoubleWordCommand(command: StoreDoubleWordCommand): void {
        const sourceValue = this.registers.get(command.sourceRegister)
        const baseAddress = this.registers.get(command.destinationRegister)
        const index = baseAddress + command.offset
        const test = 4294967296
        this.memory.writeInt32LE(-257, index)
    }
}
