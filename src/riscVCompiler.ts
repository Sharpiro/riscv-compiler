import { SourceCode } from "./sourceCode";
import { Command, AddCommand, AddImmediateCommand, MemoryCommand, MemoryCommandType, JumpAndLinkRegisterCommand, JumpAndLinkCommand } from "./addCommandSyntax";

export class Compilation {
    constructor(readonly commands: Command[], readonly labels: { [key: string]: Label }) { }
}

export class Label {
    constructor(readonly name: string, readonly address: number) { }
}

export class RiscVCompiler {
    readonly sourceCode: SourceCode
    readonly commandSizeBytes = 4

    private currentAddress = 0
    private commandNames: { [key: string]: boolean } = {
        "add": true,
        "addi": true,
        "sd": true,
        "ld": true,
        "jr": true,
        "call": true
    }
    labels: { [label: string]: Label } = {}

    constructor(source: string) {
        source = source.replace(/\r/g, "")
        source = source + "\0"
        this.sourceCode = new SourceCode(source)
    }

    compile(): Compilation {
        const commands: Command[] = []
        while (true) {
            const commandOrLabel = this.parseLine()

            if (commandOrLabel instanceof Command) {
                commands[commandOrLabel.address] = commandOrLabel

            }
            else
                this.labels[commandOrLabel.name] = commandOrLabel
            let currentChar = this.sourceCode.peekChar()
            if (currentChar == "\0") {
                currentChar = this.sourceCode.nextChar()
                break;
            }
        }

        // todo remove this hax
        const temp: any = undefined
        commands.push(temp)
        commands.push(temp)
        commands.push(temp)
        return new Compilation(commands, this.labels)
    }

    private parseLine(): Command | Label {
        const commandNameOrLabel = this.parseToken()
        let commandOrLabel: Command | Label
        var isCommand = this.commandNames[commandNameOrLabel]
        if (isCommand) {
            commandOrLabel = this.parseCommand(commandNameOrLabel)
        } else {
            commandOrLabel = this.parseLabel(commandNameOrLabel)
        }
        const currentChar = this.sourceCode.nextChar()
        return commandOrLabel
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
            case "ld":
                command = this.parseMemoryCommand(commandName, "load")
                break;
            case "jr":
                command = this.parseJumpRegisterPseudoCommand(commandName)
                break;
            case "jal":
                command = this.parseJumpRegisterPseudoCommand(commandName)
                break;
            case "ret":
                command = this.parseReturnPseudoCommand(commandName)
                break;
            case "call":
                command = this.parseCallCommand(commandName)
                break;
            default:
                throw new Error(`invalid command '${commandName}'`)
        }
        const address = this.currentAddress
        command.address = address
        this.currentAddress += this.commandSizeBytes
        // const parameters = this.parseParameters()
        // return { name: commandName, parameters: parameters }
        return command
    }

    private parseLabel(labelName: string): Label {
        let currentChar = this.sourceCode.nextChar()
        if (currentChar != ":") throw new Error("expected a ':' after label name")
        return new Label(labelName, this.currentAddress)
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
        const temp = this.sourceCode.nextChar()
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

    private parseJumpRegisterPseudoCommand(commandName: string): JumpAndLinkRegisterCommand {
        const returnRegister = this.parseRegister()
        return new JumpAndLinkRegisterCommand({
            name: commandName,
            returnRegister: returnRegister
        })
    }

    private parseReturnPseudoCommand(commandName: string): JumpAndLinkRegisterCommand {
        return new JumpAndLinkRegisterCommand({
            name: commandName,
            returnRegister: 1
        })
    }


    private parseCallCommand(commandName: string): JumpAndLinkCommand {
        const labelName = this.parseToken()
        const label = this.labels[labelName]
        if (!label) {
            throw new Error(`Could not find label with name '${labelName}'`)
        }
        return new JumpAndLinkCommand({
            name: commandName,
            returnRegister: 1,
            procedureAddress: label.address
        })
    }

    // private parseJumpAndLinkCommand(commandName: string): JumpRegisterCommand {
    //     const returnRegister = this.parseRegister()
    //     return new JumpRegisterCommand({
    //         name: commandName,
    //         returnRegister: returnRegister
    //     })
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
