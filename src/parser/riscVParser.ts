import {
    AddCommand, Command, AddImmediateCommand, Expression
} from "../syntax/addCommandSyntax";
import { Compilation } from "../syntax/compilation";
import { Label } from "../syntax/label";
import { TokenKind, Token } from "../syntax/token";
import { SyntaxTokens } from "../syntax/syntaxTokens";

export class RiscVParser {
    private readonly commandSizeBytes = 4
    private readonly labels: { [label: string]: Label } = {}
    private readonly syntaxTokens: SyntaxTokens
    private currentAddress = 0

    private commandNames: { [key: string]: boolean } = {
        add: true,
        addi: true,
        sd: true,
        ld: true,
        jr: true,
        call: true
    }

    constructor(syntaxTokens: SyntaxTokens) {
        this.syntaxTokens = syntaxTokens
    }

    compile(): Compilation {
        const commands: Command[] = []
        while (this.syntaxTokens.hasNext) {
            const commandOrLabel = this.parseCommandOrLabel()

            if (commandOrLabel instanceof Command) {
                commands[commandOrLabel.address] = commandOrLabel

            } else {
                this.labels[commandOrLabel.nameToken.value] = commandOrLabel
            }

            if (this.syntaxTokens.peekToken.kind === TokenKind.EndOfFile) {
                this.syntaxTokens.eatToken(TokenKind.EndOfFile)
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

    private parseCommandOrLabel(): Command | Label {
        // const commandNameOrLabelName = this.parseToken()
        const identifierToken = this.syntaxTokens.eatToken(TokenKind.Identifier)
        let commandOrLabel: Command | Label
        const isCommand = this.commandNames[identifierToken.valueText]
        if (isCommand) {
            commandOrLabel = this.parseCommand(identifierToken)
        } else {
            commandOrLabel = new Label(identifierToken, this.currentAddress)
        }

        // const currentChar = this.sourceCode.nextChar()
        return commandOrLabel
    }

    private parseCommand(nameToken: Token): Command {
        let command: Command
        switch (nameToken.valueText) {
            case "add":
                command = this.parseAddCommand(nameToken)
                break;
            case "addi":
                command = this.parseAddImmediateCommand(nameToken)
                break;
            // case "sb":
            // case "sw":
            // case "sd":
            //     command = this.parseMemoryCommand(nameToken, "store")
            //     break;
            // case "lw":
            // case "ld":
            //     command = this.parseMemoryCommand(nameToken, "load")
            //     break;
            // case "jr":
            //     command = this.parseJumpRegisterPseudoCommand(nameToken)
            //     break;
            // case "jal":
            //     command = this.parseJumpRegisterPseudoCommand(nameToken)
            //     break;
            // case "ret":
            //     command = this.parseReturnPseudoCommand(nameToken)
            //     break;
            // case "call":
            //     command = this.parseCallCommand(nameToken)
            //     break;
            default:
                throw new Error(`invalid command '${nameToken}'`)
        }
        const address = this.currentAddress
        command.address = address
        this.currentAddress += this.commandSizeBytes
        // const parameters = this.parseParameters()
        // return { name: commandName, parameters: parameters }
        return command
    }

    private parseAddCommand(nameToken: Token): AddCommand {
        const destinationRegisterToken = this.syntaxTokens.eatToken(TokenKind.Identifier)
        this.syntaxTokens.eatToken(TokenKind.Comma)
        const sourceRegisterOneToken = this.syntaxTokens.eatToken(TokenKind.Identifier)
        this.syntaxTokens.eatToken(TokenKind.Comma)
        const sourceRegisterTwoToken = this.syntaxTokens.eatToken(TokenKind.Identifier)

        return new AddCommand(
            nameToken,
            sourceRegisterOneToken,
            sourceRegisterTwoToken,
            destinationRegisterToken
        )
    }

    private parseAddImmediateCommand(nameToken: Token): AddImmediateCommand {
        const destinationRegisterToken = this.syntaxTokens.eatToken(TokenKind.Identifier)
        this.syntaxTokens.eatToken(TokenKind.Comma)
        const sourceRegisterToken = this.syntaxTokens.eatToken(TokenKind.Identifier)
        this.syntaxTokens.eatToken(TokenKind.Comma)
        const numericConstantToken = this.syntaxTokens.eatToken(TokenKind.NumericConstant)

        return new AddImmediateCommand(
            nameToken,
            sourceRegisterToken,
            numericConstantToken,
            destinationRegisterToken
        )
    }

    private parseExpression(): Expression {
        let expression: Expression
        switch (this.syntaxTokens.peekToken.kind) {
            case TokenKind.MinusToken:
                expression = this.parseUnaryMinusExpression()
                break;
            case TokenKind.NumericConstant:
                expression = this.parseNumericLiteralExpression()
                break;
            default:
                throw new Error("Invalid expression")
        }
        return new Expression()
    }

    private parseUnaryMinusExpression(): Expression {
        const minusToken = this.syntaxTokens.eatToken(TokenKind.MinusToken)
        return new Expression()
    }

    private parseNumericLiteralExpression(): Expression {
        return new Expression()
    }

    // private parseMemoryCommand(commandName: string, commandType: MemoryCommandType): MemoryCommand {
    //     const dataRegister = this.parseRegister()
    //     const comma1 = this.sourceCode.nextChar()
    //     if (comma1 !== ",") throw new Error(`expected ',', but was '${comma1}'`)
    //     this.sourceCode.nextChar()

    //     const offsetString = this.parseTokenUntil("(")
    //     const memoryOffset = +offsetString
    //     if (isNaN(memoryOffset)) throw new Error(`Invalid offset ${offsetString}`)
    //     this.sourceCode.nextChar()

    //     const memoryRegisterString = this.parseTokenUntil(")")
    //     const memoryRegister = this.parseRegisterFromString(memoryRegisterString)
    //     if (isNaN(memoryRegister)) throw new Error(`Invalid offset ${memoryRegisterString}`)
    //     this.sourceCode.nextChar()

    //     return new MemoryCommand({
    //         nameToken: commandName,
    //         type: commandType,
    //         dataRegister,
    //         memoryOffset,
    //         memoryRegister
    //     })
    // }

    // private parseJumpRegisterPseudoCommand(commandName: string): JumpAndLinkRegisterCommand {
    //     const returnRegister = this.parseRegister()
    //     return new JumpAndLinkRegisterCommand({
    //         nameToken: commandName,
    //         returnRegister
    //     })
    // }

    // private parseReturnPseudoCommand(commandName: string): JumpAndLinkRegisterCommand {
    //     return new JumpAndLinkRegisterCommand({
    //         nameToken: commandName,
    //         returnRegister: 1
    //     })
    // }

    // private parseCallCommand(commandName: string): JumpAndLinkCommand {
    //     const labelName = this.parseToken()
    //     const label = this.labels[labelName]
    //     if (!label) {
    //         throw new Error(`Could not find label with name '${labelName}'`)
    //     }
    //     return new JumpAndLinkCommand({
    //         nameToken: commandName,
    //         returnRegister: 1,
    //         procedureAddress: label.address
    //     })
    // }

    // private parseRegister(): number {
    //     const registerToken = this.parseToken()
    //     if (!registerToken.startsWith("x")) {
    //         throw new Error(`Expected register starting with 'x', but instead was '${registerToken}'`)
    //     }
    //     return this.parseRegisterFromString(registerToken)
    // }

    private parseRegisterFromString(registerToken: string): number {
        const numberSlice = registerToken.slice(1)
        const registerNumber = +numberSlice
        return registerNumber
    }
}
