import {
    AddCommand, Command, AddImmediateCommand, Expression, MemoryCommand, PrefixUnaryExpression
} from "../syntax/addCommandSyntax";
import { Compilation } from "../syntax/compilation";
import { Label } from "../syntax/label";
import { SyntaxKind, Token } from "../syntax/token";
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

            if (this.syntaxTokens.peekToken.kind === SyntaxKind.EndOfFile) {
                this.syntaxTokens.eatToken(SyntaxKind.EndOfFile)
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
        const identifierToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
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
            case "sb":
            case "sw":
            case "sd":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.StoreCommand)
                break;
            case "lw":
            case "ld":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.LoadCommand)
                break;
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

        return command
    }

    private parseAddCommand(nameToken: Token): AddCommand {
        const destinationRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const firstCommmaToken = this.syntaxTokens.eatToken(SyntaxKind.Comma)
        const sourceRegisterOneToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const secondCommaToken = this.syntaxTokens.eatToken(SyntaxKind.Comma)
        const sourceRegisterTwoToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)

        return new AddCommand(
            nameToken,
            firstCommmaToken,
            secondCommaToken,
            sourceRegisterOneToken,
            sourceRegisterTwoToken,
            destinationRegisterToken
        )
    }

    private parseAddImmediateCommand(nameToken: Token): AddImmediateCommand {
        const destinationRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const firstCommaToken = this.syntaxTokens.eatToken(SyntaxKind.Comma)
        const sourceRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const secondCommaToken = this.syntaxTokens.eatToken(SyntaxKind.Comma)
        const expression = this.parseExpression()

        return new AddImmediateCommand(
            nameToken,
            firstCommaToken,
            secondCommaToken,
            sourceRegisterToken,
            expression,
            destinationRegisterToken
        )
    }

    private parseExpression(): Expression {
        let expression: Expression
        switch (this.syntaxTokens.peekToken.kind) {
            case SyntaxKind.MinusToken:
                expression = this.parsePrefixUnaryExpression()
                break;
            default:
                throw new Error("Invalid expression")
        }
        return expression
    }

    private parsePrefixUnaryExpression(): PrefixUnaryExpression {
        const operatorToken = this.syntaxTokens.eatToken()
        let operatorKind: SyntaxKind
        switch (operatorToken.kind) {
            case SyntaxKind.MinusToken:
                operatorKind = SyntaxKind.UnaryMinusExpression
                break;
            default:
                throw new Error(`invalid prefix unary operator '${operatorToken.value}'`)
        }
        const operand = this.syntaxTokens.eatToken(SyntaxKind.NumericLiteral);

        return new PrefixUnaryExpression(
            operatorKind,
            operatorToken,
            operand
        )
    }

    private parseMemoryCommand(nameToken: Token, kind: SyntaxKind): MemoryCommand {
        const dataRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const commaToken = this.syntaxTokens.eatToken(SyntaxKind.Comma)
        const memoryOffsetToken = this.syntaxTokens.eatToken(SyntaxKind.NumericLiteral)
        const openParenToken = this.syntaxTokens.eatToken(SyntaxKind.OpenParen)
        const memoryRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const closeParenToken = this.syntaxTokens.eatToken(SyntaxKind.CloseParen)

        return new MemoryCommand(
            nameToken,
            kind,
            commaToken,
            dataRegisterToken,
            memoryOffsetToken,
            memoryRegisterToken,
            openParenToken,
            closeParenToken
        )
    }

    // private parseJumpRegisterPseudoCommand(nameToken: Token): JumpAndLinkRegisterCommand {
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
