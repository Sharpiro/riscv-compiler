import { SourceCode } from "./sourceCode";
import { Command, AddCommand, AddImmediateCommand, StoreDoubleWordCommand, StoreWordCommand, StoreCommand } from "./addCommandSyntax";

export class RiscVCompiler {
    readonly sourceCode: SourceCode

    constructor(public readonly source: string) {
        source = source + "\0"
        this.sourceCode = new SourceCode(source)
    }

    compile(): Command[] {
        const commands: Command[] = []

        while (true) {
            const command = this.parseCommandLine()
            commands.push(command)
            const currentChar = this.sourceCode.nextChar()
            if (currentChar == "\0") {
                return commands
            }
        }
    }

    private parseCommandLine(): Command {
        const commandName = this.parseCommandName()
        let command: Command
        switch (commandName) {
            case "add":
                command = this.parseAddCommand()
                break;
            case "addi":
                command = this.parseAddImmediateCommand()
                break;
            case "sw":
            case "sd":
                command = this.parseStoreCommand(commandName)
                break;
            // case "lw":
            //     command = this.parseLoadWordCommand()
            //     break;
            default:
                throw new Error(`invalid command '${commandName}'`)
        }
        // const parameters = this.parseParameters()
        // return { name: commandName, parameters: parameters }
        return command
    }

    private parseCommandName(): string {
        const commandName = this.parseToken()
        const currentChar = this.sourceCode.nextChar()
        if (currentChar != " ") throw new Error("expected a space after command name")
        return commandName
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
        const sourceRegister1 = this.parseRegister()
        const comma2 = this.sourceCode.nextChar()
        if (comma2 !== ",") throw new Error(`expected ',', but was '${comma2}'`)
        this.sourceCode.nextChar()
        const constantValueText = this.parseToken()
        const constantValue = +constantValueText
        if (isNaN(constantValue)) {
            throw new Error(`invalid constant value '${constantValueText}'`)
        }
        return new AddImmediateCommand({
            sourceRegisterOne: sourceRegister1,
            constantValue: constantValue,
            destinationRegister: destinationRegister
        })
    }

    private parseStoreCommand(commandName: string): StoreCommand {
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

        return new StoreCommand({
            name: commandName,
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
            if (currentChar == " " || currentChar == "\n" || currentChar == "," || currentChar == "\0") { // what does removing && do???
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
