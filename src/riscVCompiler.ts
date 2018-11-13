import { SourceCode } from "./sourceCode";
import { Command, AddCommand, AddImmediateCommand, MemoryCommand, MemoryCommandType } from "./addCommandSyntax";

export class Compilation {
    constructor(readonly commands: Command[], readonly data: { [key: string]: Label }) { }
}

export class Label {
    constructor(readonly name: string, readonly address: number) { }
}

export class RiscVCompiler {
    readonly sourceCode: SourceCode
    private currentAddress = 0
    private commandNames: { [key: string]: boolean } = { "add": true, "addi": true }

    constructor(public readonly source: string) {
        source = source + "\0"
        this.sourceCode = new SourceCode(source)
    }

    compile(): Compilation {
        const commands: Command[] = []
        let labels: { [key: string]: Label } = {}

        while (true) {
            const commandOrLabel = this.parseLine()

            if (commandOrLabel instanceof Command) {
                labels[commandOrLabel.address] = commandOrLabel
            }
            else
                commands.push(commandOrLabel)
            const currentChar = this.sourceCode.nextChar()
            if (currentChar == "\0") {
                break;
            }
        }

        return new Compilation(commands, labels)
    }

    private parseLine(): Command | Label {
        const commandNameOrLabel = this.parseToken()
        var isCommand = this.commandNames[commandNameOrLabel]
        if (isCommand) {
            const command = this.parseCommand(commandNameOrLabel)
            return command
        }
        const label = this.parseLabel(commandNameOrLabel)
        return label
    }

    private parseCommand(commandName: string): Command {
        const currentChar = this.sourceCode.nextChar()
        if (currentChar != " ") throw new Error("expected a space after command name")
        let command: Command
        switch (commandName) {
            case "add":
                command = this.parseAddCommand()
                break;
            case "addi":
                command = this.parseAddImmediateCommand()
                break;
            case "sb":
            case "sw":
            case "sd":
                command = this.parseMemoryCommand(commandName, "store")
                break;
            case "lw":
                command = this.parseMemoryCommand(commandName, "load")
                break;
            default:
                throw new Error(`invalid command '${commandName}'`)
        }
        const address = this.currentAddress
        command.address = address
        this.currentAddress += 4
        // const parameters = this.parseParameters()
        // return { name: commandName, parameters: parameters }
        return command
    }

    private parseLabel(labelName: string): Label {
        const currentChar = this.sourceCode.nextChar()
        if (currentChar != ":") throw new Error("expected a ':' after command name")
        const label = this.parseToken()
        return new Label(labelName, -1)
    }

    private parseAddCommand(): AddCommand {
        const destinationRegister = this.parseRegister()
        const comma1 = this.sourceCode.nextChar()
        if (comma1 !== ",") throw new Error(`expected ',', but was '${comma1}'`)
        this.sourceCode.nextChar()
        const sourceRegister1 = this.parseRegister()
        const comma2 = this.sourceCode.nextChar()
        if (comma2 !== ",") throw new Error(`expected ',', but was '${comma2}'`)
        this.sourceCode.nextChar()
        const sourceRegister2 = this.parseRegister()
        return new AddCommand({
            sourceRegisterOne: sourceRegister1,
            sourceRegisterTwo: sourceRegister2,
            destinationRegister: destinationRegister
        })
    }

    private parseAddImmediateCommand(): AddImmediateCommand {
        const destinationRegister = this.parseRegister()
        const comma1 = this.sourceCode.nextChar()
        if (comma1 !== ",") throw new Error(`expected ',', but was '${comma1}'`)
        this.sourceCode.nextChar()
        const sourceRegister = this.parseRegister()
        const comma2 = this.sourceCode.nextChar()
        if (comma2 !== ",") throw new Error(`expected ',', but was '${comma2}'`)
        this.sourceCode.nextChar()
        const constantValueText = this.parseToken()
        const constantValue = +constantValueText
        if (isNaN(constantValue)) {
            throw new Error(`invalid constant value '${constantValueText}'`)
        }
        return new AddImmediateCommand({
            sourceRegister: sourceRegister,
            constantValue: constantValue,
            destinationRegister: destinationRegister
        })
    }

    private parseMemoryCommand(commandName: string, commandType: MemoryCommandType): MemoryCommand {
        const dataRegister = this.parseRegister()
        const comma1 = this.sourceCode.nextChar()
        if (comma1 !== ",") throw new Error(`expected ',', but was '${comma1}'`)
        this.sourceCode.nextChar()

        const offsetString = this.parseTokenUntil("(")
        const memoryOffset = +offsetString
        if (isNaN(memoryOffset)) throw new Error(`Invalid offset ${offsetString}`)
        this.sourceCode.nextChar()

        const memoryRegisterString = this.parseTokenUntil(")")
        const memoryRegister = this.parseRegisterFromString(memoryRegisterString)
        if (isNaN(memoryRegister)) throw new Error(`Invalid offset ${memoryRegisterString}`)
        this.sourceCode.nextChar()

        return new MemoryCommand({
            name: commandName,
            type: commandType,
            dataRegister: dataRegister,
            memoryOffset: memoryOffset,
            memoryRegister: memoryRegister
        })
    }

    // private parseLoadWordCommand(): LoadWordCommand {

    // }

    private parseRegister(): number {
        const registerToken = this.parseToken()
        if (!registerToken.startsWith("x")) {
            throw new Error(`Expected register starting with 'x', but instead was '${registerToken}'`)
        }
        return this.parseRegisterFromString(registerToken)
    }

    private parseRegisterFromString(registerToken: string): number {
        const numberSlice = registerToken.slice(1)
        const registerNumber = +numberSlice
        return registerNumber
    }

    private parseToken(): string {
        let token = ""
        while (true) {
            const currentChar = this.sourceCode.peekChar()
            if (currentChar == " " || currentChar == "\n" || currentChar == ","
                || currentChar == ":") {
                return token
            }
            token += this.sourceCode.nextChar()
        }
    }

    private parseTokenUntil(char: string): string {
        let token = ""
        let currentChar = this.sourceCode.peekChar()
        while (currentChar !== char) {
            token += this.sourceCode.nextChar()
            currentChar = this.sourceCode.peekChar()
        }
        return token
    }
}
