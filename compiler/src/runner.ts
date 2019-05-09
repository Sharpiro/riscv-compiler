import { Buffer } from "buffer"
import { Compilation } from "./syntax/compilation";
import { Registers } from "./registers";
import {
    Command, AddImmediateCommand, Expression, NumericLiteralExpression, PrefixUnaryExpression,
    MemoryCommand, AddCommand, CallPseudoCommand, JumpRegisterPseudoCommand
} from "./syntax/addCommandSyntax";
import { SyntaxKind } from "./syntax/token";
import { SourceCode } from "./parser/sourceCode";

export interface Snapshot {
    registers: Registers,
    memory: Buffer
}

export class CompilationError extends Error {
    name = CompilationError.name
}

export class Runner {
    private readonly commandSizeBytes = 1
    private readonly registers = new Registers()
    private readonly memory = Buffer.alloc(32)
    private snapshots: Snapshot[] = []
    private programCounter = 0

    constructor(
        private readonly compilation: Compilation,
        private readonly sourceCode: SourceCode
    ) { }

    run(): Snapshot[] {
        const mainFunctionLabel = this.compilation.labels.main
        if (!mainFunctionLabel) {
            throw new Error("Could not find 'main' entry point into program")
        }

        this.programCounter = mainFunctionLabel.address
        while (this.programCounter < this.compilation.commands.length) {
            const currentCommand = this.compilation.commands[this.programCounter]
            this.runCommand(currentCommand)
        }

        this.snapshots.push({ registers: this.registers, memory: this.memory })
        return this.snapshots
    }

    private runCommand(command: Command): void {
        let incrementProgramCounter = true
        try {
            switch (command.nameToken.value) {
                case "#":
                    const newBuffer = Buffer.alloc(this.memory.length)
                    this.memory.copy(newBuffer)
                    this.snapshots.push({ registers: this.registers.copy(), memory: newBuffer })
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
        } catch (err) {
            const lineInfo = command.getLine(this.sourceCode)
            throw new CompilationError(`test.riscv: [${lineInfo.line}, ${lineInfo.column}]: error: ${err.message}`)
        }

        if (incrementProgramCounter) {
            this.programCounter += this.commandSizeBytes
        }
    }

    private runAddCommand(command: AddCommand): void {
        const valueOne = this.registers.getByName(command.sourceRegisterOneToken.value)
        const valueTwo = this.registers.getByName(command.sourceRegisterTwoToken.value)
        const result = valueOne + valueTwo
        this.registers.setByName(command.destinationRegisterToken.value, result)
    }

    private runAddImmediateCommand(command: AddImmediateCommand): void {
        const sourceRegisterValue = this.registers.getByName(command.sourceRegisterToken.value as string)
        const destinationRegister = command.destinationRegisterToken.value as string
        const constantValue = this.evaluateExpression(command.expression)
        const addResult = sourceRegisterValue + constantValue
        this.registers.setByName(destinationRegister, addResult)
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

        const memoryAddress = this.registers.getByName(command.memoryRegisterToken.value)
        const memoryOffsetConstant = +command.memoryOffsetToken.value
        let dataRegisterValue = this.registers.getByName(command.dataRegisterToken.value)

        if (commandType === "store") {
            this.writeLEToMemory(dataRegisterValue, memoryAddress, memoryOffsetConstant, byteCount)
        } else {
            const number = this.readLEFromMemory(memoryAddress, memoryOffsetConstant, byteCount)
            this.registers.setByName(command.dataRegisterToken.value, number)
        }
    }

    private runCallPseudoCommand(command: CallPseudoCommand): void {
        const returnRegister = 1
        const procedureLabel = this.compilation.labels[command.functionName.value]
        if (!procedureLabel) {
            throw new CompilationError(`label '${command.functionName.value}' is not defined`)
        }

        this.registers.set(returnRegister, this.programCounter + this.commandSizeBytes)
        this.programCounter = procedureLabel.address
    }

    private runJumpRegisterPseudoCommand(command: JumpRegisterPseudoCommand): void {
        const returnAddress = this.registers.getByName(command.returnRegisterToken.value)

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

    private writeLEToMemory(value: number, memoryBaseAddress: number, offset: number, sizeBytes: number) {
        const iterations = sizeBytes - 1
        let index = memoryBaseAddress + offset
        if (index + iterations >= this.memory.length) {
            throw new Error(`insufficient memory (${this.memory.length} bytes)to write '${sizeBytes}'
                bytes @ baseAddress '${memoryBaseAddress}', offset '${offset} (index '${index}')`)
        }
        this.memory[index] = value & 255
        for (let i = 0; i < iterations; i++) {
            value = value >>> 8
            index++
            this.memory[index] = value
        }
    }

    private readLEFromMemory(memoryBaseAddress: number, offset: number, sizeBytes: number) {
        const iterations = sizeBytes - 1
        const startIndex = memoryBaseAddress + offset
        const endIndex = memoryBaseAddress + offset + iterations

        let number = this.memory[endIndex]
        for (let index = endIndex - 1; index >= startIndex; index--) {
            const shiftOp = number << 8;
            const orOp = shiftOp | this.memory[index]
            number = orOp
        }
        return number
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
