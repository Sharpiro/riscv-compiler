import { SourceCode } from "./sourceCode";
import { Command, AddCommand, AddImmediateCommand } from "./addCommandSyntax";

export class Compiler {
    readonly sourceCode: SourceCode

    constructor(public readonly source: string) {
        source = source + "\0"
        this.sourceCode = new SourceCode(source, 0)
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
        const commandName = "add"
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
            name: commandName,
            sourceRegisterOne: sourceRegister1,
            sourceRegisterTwo: sourceRegister2,
            destinationRegister: destinationRegister
        })
    }

    private parseAddImmediateCommand(): AddImmediateCommand {
        const commandName = "addi"
        const destinationRegister = this.parseRegister()
        const comma1 = this.sourceCode.nextChar()
        if (comma1 !== ",") throw new Error(`expected ',', but was '${comma1}'`)
        this.sourceCode.nextChar()
        const sourceRegister1 = this.parseRegister()
        const comma2 = this.sourceCode.nextChar()
        if (comma2 !== ",") throw new Error(`expected ',', but was '${comma2}'`)
        this.sourceCode.nextChar()
        const constantValueText = this.sourceCode.nextChar()
        const constantValue = +constantValueText
        if (isNaN(constantValue)) {
            throw new Error(`invalid constant value '${constantValueText}'`)
        }
        return new AddImmediateCommand({
            name: commandName,
            sourceRegisterOne: sourceRegister1,
            constantValue: constantValue,
            destinationRegister: destinationRegister
        })
    }

    // parseParameters(): string[] {
    //     const tokens: string[] = []
    //     while (true) {
    //         const token = this.parseToken()
    //         if (token.length < 2) throw new Error(`Invalid token size line '${this.sourceCode.currentLine}', column '${this.sourceCode.currentColumn}'`)
    //         tokens.push(token)
    //         const currentChar = this.sourceCode.peekChar()
    //         if (currentChar == "\n" || currentChar == "\0") {
    //             return tokens
    //         }
    //         if (currentChar == ",") {
    //             this.sourceCode.nextChar()
    //         }
    //         this.sourceCode.nextChar()
    //     }
    // }

    private parseRegister(): number {
        const register = this.parseToken()
        if (!register.startsWith("x")) {
            throw new Error(`Expected register starting with 'x', but instead was '${register}'`)
        }
        const numberSlice = register.slice(1)
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
}
