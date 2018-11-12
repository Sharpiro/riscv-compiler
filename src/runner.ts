import { Command, AddCommand, AddImmediateCommand, MemoryCommand } from "./addCommandSyntax";
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
            case "lw":
                this.runMemoryCommand(command as MemoryCommand)
                break
            // this.runLoadCommand(command as MemoryCommand)
            // break
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
        const valueOne = this.registers.get(command.sourceRegister)
        const result = valueOne + command.constantValue
        this.registers.set(command.destinationRegister, result)
    }

    private runMemoryCommand(command: MemoryCommand): void {
        const memoryAddress = this.registers.get(command.memoryRegister)
        let byteSize: number
        switch (command.name) {
            case "sb":
                byteSize = 1
                break
            case "sw":
            case "lw":
                byteSize = 4
                break
            case "sd":
                byteSize = 8
                break
            default:
                throw new Error(`invalid store command '${command.name}'`)
        }
        if (command.type == "store") {
            this.writeLEToMemory(command.dataRegister, memoryAddress, command.memoryOffset, byteSize)
        }
        else {
            this.readLEFromMemory(command.dataRegister, memoryAddress, command.memoryOffset, byteSize)
        }
    }

    private writeLEToMemory(dataRegister: number, memoryBaseAddress: number, offset: number, sizeBytes: number) {
        let dataValue = this.registers.get(dataRegister)
        const iterations = sizeBytes - 1
        let index = memoryBaseAddress + offset
        if (index + iterations >= this.memory.length) {
            throw new Error(`insufficient memory (${this.memory.length} bytes)to write '${sizeBytes}' bytes @ baseAddress '${memoryBaseAddress}', offset '${offset} (index '${index}')`)
        }
        this.memory[index] = dataValue & 255
        for (let i = 0; i < iterations; i++) {
            dataValue = dataValue >>> 8
            index++
            this.memory[index] = dataValue
        }
    }

    private readLEFromMemory(dataRegister: number, memoryBaseAddress: number, offset: number, sizeBytes: number) {
        const iterations = sizeBytes - 1
        let startIndex = memoryBaseAddress + offset
        let endIndex = memoryBaseAddress + offset + iterations

        let number = this.memory[endIndex]
        for (let index = endIndex - 1; index >= startIndex; index--) {
            let shiftOp = number << 8;
            let orOp = shiftOp | this.memory[index]
            number = orOp
        }

        this.registers.set(dataRegister, number)
    }
}
