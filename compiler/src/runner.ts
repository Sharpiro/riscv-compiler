import { Buffer } from "buffer"
import { Compilation } from "./syntax/compilation";
import { Registers } from "./registers";
import {
    Command, AddImmediateCommand, Expression, NumericLiteralExpression, PrefixUnaryExpression,
    MemoryCommand, AddCommand, CallPseudoCommand, JumpRegisterPseudoCommand
} from "./syntax/addCommandSyntax";
import { SyntaxKind } from "./syntax/token";

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
    private readonly commandSizeBytes = 1
    private readonly registers = new Registers()
    private readonly memory = Buffer.alloc(32)
    private snapshots: Execution[] = []
    private programCounter = 0

    constructor(compilation: Compilation) {
        this.compilation = compilation
    }

    run(): Execution[] {
        const mainFunctionLabel = this.compilation.labels.main
        if (!mainFunctionLabel) {
            throw new Error("Could not find 'main' entry point into program")
        }

        this.programCounter = mainFunctionLabel.address
        while (this.programCounter < this.compilation.commands.length) {
            const currentCommand = this.compilation.commands[this.programCounter]
            this.runCommand(currentCommand)
        }

        this.snapshots.push(new Execution(this.registers, this.memory))
        return this.snapshots
    }

    private runCommand(command: Command): void {
        let incrementProgramCounter = true
        switch (command.nameToken.value) {
            case "#":
                const newBuffer = Buffer.alloc(this.memory.length)
                this.memory.copy(newBuffer)
                this.snapshots.push(new Execution(this.registers.copy(), newBuffer))
                break;
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
                this.runCallPseudoCommand(command as CallPseudoCommand)
                incrementProgramCounter = false
                break
            case "jr":
                this.runJumpRegisterPseudoCommand(command as JumpRegisterPseudoCommand)
                incrementProgramCounter = false
                break
            case "ret":
                this.runReturnPseudoCommand(command)
                incrementProgramCounter = false
                break
            default:
                throw new Error(`invalid command '${command.kindText}'`)
        }

        if (incrementProgramCounter) {
            this.programCounter += this.commandSizeBytes
        }
    }

    private runAddCommand(command: AddCommand): void {
        const sourceRegisterOne = this.parseRegisterFromString(command.sourceRegisterOneToken.value)
        const sourceRegisterTwo = this.parseRegisterFromString(command.sourceRegisterTwoToken.value)
        const destinationRegister = this.parseRegisterFromString(command.destinationRegisterToken.value)
        const valueOne = this.registers.get(sourceRegisterOne)
        const valueTwo = this.registers.get(sourceRegisterTwo)
        const result = valueOne + valueTwo
        this.registers.set(destinationRegister, result)
    }

    private runAddImmediateCommand(command: AddImmediateCommand): void {
        const sourceRegister = this.parseRegisterFromString(command.sourceRegisterToken.value)
        const sourceRegisterValue = this.registers.get(sourceRegister)
        const destinationRegister = this.parseRegisterFromString(command.destinationRegisterToken.value)
        const constantValue = this.evaluateExpression(command.expression)
        const addResult = sourceRegisterValue + constantValue
        this.registers.set(destinationRegister, addResult)
    }

    private evaluateExpression(expression: Expression): number {
        let value: number
        switch (expression.kind) {
            case SyntaxKind.NumericLiteralExpression:
                value = this.evaluateNumericLiteralExpression(expression as NumericLiteralExpression)
                break;
            case SyntaxKind.UnaryMinusExpression:
                value = this.evaluatePrefixUnaryExpression(expression as PrefixUnaryExpression)
                break;
            default:
                throw new Error(`Invalid expression '${expression.kind}'`)
        }

        return value
    }

    private evaluateNumericLiteralExpression(expression: NumericLiteralExpression): number {
        return expression.numericLiteral.value
    }

    private evaluatePrefixUnaryExpression(expression: PrefixUnaryExpression): number {
        let value: number
        switch (expression.kind) {
            case SyntaxKind.UnaryMinusExpression:
                value = this.evaluateUnaryMinusExpression(expression)
                break;
            default:
                throw new Error(`invalid prefix unary kind '${expression.kind}'`)
        }

        return value
    }

    private evaluateUnaryMinusExpression(expression: PrefixUnaryExpression): number {
        return -expression.operand.value
    }

    private runMemoryCommand(command: MemoryCommand): void {
        let byteCount: number
        let commandType: "store" | "load"
        switch (command.kind) {
            case SyntaxKind.StoreByte:
                byteCount = 1
                commandType = "store"
                break;
            case SyntaxKind.StoreWord:
            case SyntaxKind.StoreDoubleWord:
                byteCount = 4
                commandType = "store"
                break;
            case SyntaxKind.LoadByte:
                byteCount = 1
                commandType = "load"
                break;
            case SyntaxKind.LoadWord:
            case SyntaxKind.LoadDoubleWord:
                byteCount = 4
                commandType = "load"
                break;
            default:
                throw new Error(`Invalid memory command '${command.kind}'`)
        }

        const memoryRegister = this.parseRegisterFromString(command.memoryRegisterToken.value)
        const memoryAddress = this.registers.get(memoryRegister)
        const memoryOffsetConstant = +command.memoryOffsetToken.value
        const dataRegister = this.parseRegisterFromString(command.dataRegisterToken.value)

        if (commandType === "store") {
            this.writeLEToMemory(dataRegister, memoryAddress, memoryOffsetConstant, byteCount)
        } else {
            this.readLEFromMemory(dataRegister, memoryAddress, memoryOffsetConstant, byteCount)
        }
    }

    private runCallPseudoCommand(command: CallPseudoCommand): void {
        const returnRegister = 1
        const procedureLabel = this.compilation.labels[command.functionName.value]

        this.registers.set(returnRegister, this.programCounter + this.commandSizeBytes)
        this.programCounter = procedureLabel.address
    }

    private runJumpRegisterPseudoCommand(command: JumpRegisterPseudoCommand): void {
        const returnRegister = this.parseRegisterFromString(command.returnRegisterToken.value)
        const returnAddress = this.registers.get(returnRegister)

        if (returnAddress === -1) {
            this.programCounter += this.commandSizeBytes
        } else {
            this.programCounter = returnAddress
        }
    }

    private runReturnPseudoCommand(command: Command): void {
        const returnRegister = 1
        const returnAddress = this.registers.get(returnRegister)

        if (returnAddress === -1) {
            this.programCounter += this.commandSizeBytes
        } else {
            this.programCounter = returnAddress
        }
    }

    // private runJumpAndLinkCommand(command: JumpAndLinkCommand): void {
    //     this.registers.set(command.returnRegister, this.programCounter + this.commandSizeBytes)
    //     this.programCounter = command.procedureAddress
    // }

    // private runJumpAndLinkRegisterCommand(command: JumpAndLinkRegisterCommand): void {
    //     const returnAddress = this.registers.get(command.returnRegister)
    //     if (returnAddress === -1) {
    //         this.programCounter += this.commandSizeBytes
    //     } else {
    //         this.programCounter = returnAddress + command.offset
    //     }
    // }

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

    private parseRegisterFromString(registerText: string): number {
        const numberSlice = registerText.slice(1)
        const registerNumber = +numberSlice
        if (isNaN(registerNumber)) {
            throw new Error(`Error converting register string '${registerText}' to number`)
        }
        return registerNumber
    }
}
