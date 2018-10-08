import { Command, AddCommand, AddImmediateCommand, StoreCommand } from "./addCommandSyntax";
import { Registers } from "./registers";
import { Buffer } from "buffer"

export class Runner {
    readonly registers = new Registers()
    readonly memory = Buffer.alloc(24)

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
            case "sw":
            case "sd":
                this.runStoreCommand(command as StoreCommand)
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

    private runStoreCommand(command: StoreCommand): void {
        const sourceValue = this.registers.get(command.dataRegister)
        const baseAddress = this.registers.get(command.memoryRegister)
        const index = baseAddress + command.memoryOffset
        let byteSize: number
        switch (command.name) {
            case "sw":
                byteSize = 4
                break;
            case "sd":
                byteSize = 8
                break;
            default:
                throw new Error(`invalid store command '${command.name}'`)
        }
        this.writeLEToMemory(sourceValue, index, byteSize)
    }

    private writeLEToMemory(value: number, offset: number, sizeBytes: number) {
        const iterations = sizeBytes - 1
        if (offset + iterations >= this.memory.length) throw new Error(`insufficient memory to write '${sizeBytes}' bytes @ offset '${offset}'`)
        this.memory[offset] = value
        for (let i = 0; i < iterations; i++) {
            value = value >>> 8
            offset++
            this.memory[offset] = value
        }
    }
}
