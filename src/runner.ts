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
            case "sb":
            case "sw":
            case "sd":
                this.runStoreCommand(command as StoreCommand)
                break
            case "lw":
                this.runLoadCommand(command as StoreCommand)
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
        let byteSize: number
        switch (command.name) {
            case "sb":
                byteSize = 1
                break
            case "sw":
                byteSize = 4
                break
            case "sd":
                byteSize = 8
                break
            default:
                throw new Error(`invalid store command '${command.name}'`)
        }
        this.writeLEToMemory(sourceValue, baseAddress, command.memoryOffset, byteSize)
    }

    private runLoadCommand(command: StoreCommand): void {
        const registerValue = this.registers.get(command.dataRegister)
        const memoryBaseAddress = this.registers.get(command.memoryRegister)
        let byteSize: number
        switch (command.name) {
            case "sb":
                byteSize = 1
                break
            case "sw":
                byteSize = 4
                break
            case "sd":
                byteSize = 8
                break
            default:
                throw new Error(`invalid store command '${command.name}'`)
        }
        this.writeLEToMemory(registerValue, memoryBaseAddress, command.memoryOffset, byteSize)
    }

    private writeLEToMemory(value: number, memoryBaseAddress: number, offset: number, sizeBytes: number) {
        let index = memoryBaseAddress + offset
        const iterations = sizeBytes - 1
        if (index + iterations >= this.memory.length) {
            throw new Error(`insufficient memory (${this.memory.length} bytes)to write '${sizeBytes}' bytes @ baseAddress '${memoryBaseAddress}', offset '${offset} (index '${index}')`)
        }
        this.memory[index] = value
        for (let i = 0; i < iterations; i++) {
            value = value >>> 8
            index++
            this.memory[index] = value
        }
    }
}
