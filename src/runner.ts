import { Buffer } from "buffer"
import {
    AddCommand, AddImmediateCommand, Command,
    JumpAndLinkCommand, JumpAndLinkRegisterCommand, MemoryCommand
} from "./addCommandSyntax";
import { Registers } from "./registers";
import { Compilation } from "./riscVCompiler";

export class Execution {
    registers: Registers
    memory: Buffer

    constructor(registers: Registers, memory: Buffer) {
        this.registers = registers
        this.memory = memory
    }
}

export class Runner {
    private readonly compilation: Compilation
    private readonly commandSizeBytes = 4
    private readonly registers = new Registers()
    private readonly memory = Buffer.alloc(32)

    private programCounter = 0

    constructor(compilation: Compilation) {
        this.compilation = compilation
    }

    run(): Execution {
        const mainFunctionLabel = this.compilation.labels.main
        if (!mainFunctionLabel) {
            throw new Error("Could not find 'main' entry point into program")
        }

        this.programCounter = mainFunctionLabel.address
        while (this.programCounter < this.compilation.commands.length) {
            const currentCommand = this.compilation.commands[this.programCounter]
            this.runCommand(currentCommand)
        }

        return new Execution(this.registers, this.memory)
    }

    private runCommand(command: Command): void {
        let incrementProgramCounter = true
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
            case "ld":
                this.runMemoryCommand(command as MemoryCommand)
                break
            case "call":
                // case "jal":
                this.runJumpAndLinkCommand(command as JumpAndLinkCommand)
                incrementProgramCounter = false
                break
            case "jr":
                this.runJumpAndLinkRegisterCommand(command as JumpAndLinkRegisterCommand)
                incrementProgramCounter = false
                break
            default:
                throw new Error(`invalid command '${command.name}'`)
        }

        if (incrementProgramCounter) {
            this.programCounter += this.commandSizeBytes
        }
    }

    private runAddCommand(command: AddCommand): void {
        const valueOne = this.registers.get(command.sourceRegisterOne)
        const valueTwo = this.registers.get(command.sourceRegisterTwo)
        const result = valueOne + valueTwo
        this.registers.set(command.destinationRegister, result)
    }

    private runAddImmediateCommand(command: AddImmediateCommand): void {
        const sourceRegisterValue = this.registers.get(command.sourceRegister)
        const addResult = sourceRegisterValue + command.constantValue
        this.registers.set(command.destinationRegister, addResult)
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
            case "ld":
                byteSize = 8
                break
            default:
                throw new Error(`invalid store command '${command.name}'`)
        }
        if (command.type === "store") {
            this.writeLEToMemory(command.dataRegister, memoryAddress, command.memoryOffset, byteSize)
        } else {
            this.readLEFromMemory(command.dataRegister, memoryAddress, command.memoryOffset, byteSize)
        }
    }

    private runJumpAndLinkCommand(command: JumpAndLinkCommand): void {
        this.registers.set(command.returnRegister, this.programCounter + this.commandSizeBytes)
        this.programCounter = command.procedureAddress
    }

    private runJumpAndLinkRegisterCommand(command: JumpAndLinkRegisterCommand): void {
        const returnAddress = this.registers.get(command.returnRegister)
        if (returnAddress === -1) {
            this.programCounter += this.commandSizeBytes
        } else {
            this.programCounter = returnAddress + command.offset
        }
    }

    private writeLEToMemory(dataRegister: number, memoryBaseAddress: number, offset: number, sizeBytes: number) {
        let dataValue = this.registers.get(dataRegister)
        const iterations = sizeBytes - 1
        let index = memoryBaseAddress + offset
        if (index + iterations >= this.memory.length) {
            throw new Error(`insufficient memory (${this.memory.length} bytes)to write '${sizeBytes}'
                bytes @ baseAddress '${memoryBaseAddress}', offset '${offset} (index '${index}')`)
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
        const startIndex = memoryBaseAddress + offset
        const endIndex = memoryBaseAddress + offset + iterations

        let number = this.memory[endIndex]
        for (let index = endIndex - 1; index >= startIndex; index--) {
            const shiftOp = number << 8;
            const orOp = shiftOp | this.memory[index]
            number = orOp
        }

        this.registers.set(dataRegister, number)
    }
}
