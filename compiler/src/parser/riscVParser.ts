import {
    AddCommand, Command, AddImmediateCommand, Expression, MemoryCommand,
    PrefixUnaryExpression, JumpRegisterPseudoCommand, CallPseudoCommand, NumericLiteralExpression
} from "../syntax/addCommandSyntax";
import { Compilation } from "../syntax/compilation";
import { Label } from "../syntax/label";
import { SyntaxKind, Token } from "../syntax/token";
import { SyntaxTokens } from "../syntax/syntaxTokens";

export class RiscVParser {
    private readonly commandSizeBytes = 1
    private readonly labels: { [label: string]: Label } = {}
    private readonly syntaxTokens: SyntaxTokens
    private currentAddress = 0

    private commandNames: { [key: string]: boolean } = {
        add: true,
        addi: true,
        sw: true,
        sd: true,
        lw: true,
        ld: true,
        jr: true,
        call: true,
        "#": true
    }

    constructor(syntaxTokens: SyntaxTokens) {
        this.syntaxTokens = syntaxTokens
    }

    parse(): Compilation {
        const commands: Command[] = []
        while (this.syntaxTokens.hasNext) {
            const commandOrLabel = this.parseCommandOrLabel()

            if (commandOrLabel instanceof Command) {
                commands[this.currentAddress] = commandOrLabel
                this.currentAddress += this.commandSizeBytes

            } else {
                this.labels[commandOrLabel.nameToken.value] = commandOrLabel
            }

            if (this.syntaxTokens.peekToken.kind === SyntaxKind.EndOfFile) {
                this.syntaxTokens.eatToken(SyntaxKind.EndOfFile)
                break;
            }
        }

        // todo remove this hax
        // const temp: any = undefined
        // commands.push(temp)
        // commands.push(temp)
        // commands.push(temp)
        return { commands, labels: this.labels }
    }

    private parseCommandOrLabel(): Command | Label {
        const identifierToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        let commandOrLabel: Command | Label
        const isCommand = !!this.commandNames[identifierToken.valueText]
        if (isCommand) {
            commandOrLabel = this.parseCommand(identifierToken)
        } else {
            commandOrLabel = this.parseLabel(identifierToken)
        }

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
                command = this.parseMemoryCommand(nameToken, SyntaxKind.StoreByte)
                break
            case "sw":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.StoreWord)
                break
            case "sd":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.StoreDoubleWord)
                break;
            case "lb":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.LoadByte)
                break;
            case "lw":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.LoadWord)
                break;
            case "ld":
                command = this.parseMemoryCommand(nameToken, SyntaxKind.LoadDoubleWord)
                break;
            case "jr":
                command = this.parseJumpRegisterPseudoCommand(nameToken)
                break;
            case "call":
                command = this.parseCallPseudoCommand(nameToken)
                break;
            case "#":
                command = new Command(nameToken, SyntaxKind.StateCommand)
                break;
            default:
                throw new Error(`invalid command '${nameToken.valueText}'`)
        }

        return command
    }

    private parseLabel(name: Token): Label {
        const openParen = this.syntaxTokens.eatToken(SyntaxKind.OpenParenToken)
        const closeParen = this.syntaxTokens.eatToken(SyntaxKind.CloseParenToken)
        const colon = this.syntaxTokens.eatToken(SyntaxKind.ColonToken)

        return new Label(
            name,
            openParen,
            closeParen,
            colon,
            this.currentAddress
        )
    }

    private parseAddCommand(nameToken: Token): AddCommand {
        const destinationRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const firstCommmaToken = this.syntaxTokens.eatToken(SyntaxKind.CommaToken)
        const sourceRegisterOneToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const secondCommaToken = this.syntaxTokens.eatToken(SyntaxKind.CommaToken)
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
        const firstCommaToken = this.syntaxTokens.eatToken(SyntaxKind.CommaToken)
        const sourceRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const secondCommaToken = this.syntaxTokens.eatToken(SyntaxKind.CommaToken)
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
            case SyntaxKind.NumericLiteralToken:
                expression = this.parseNumericLiteralExpression()
                break;
            case SyntaxKind.MinusToken:
                expression = this.parsePrefixUnaryExpression()
                break;
            default:
                throw new Error("Invalid expression")
        }
        return expression
    }

    private parseNumericLiteralExpression(): NumericLiteralExpression {
        const numericLiteralToken = this.syntaxTokens.eatToken(SyntaxKind.NumericLiteralToken)

        return new NumericLiteralExpression(numericLiteralToken)
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
        const operand = this.syntaxTokens.eatToken(SyntaxKind.NumericLiteralToken);

        return new PrefixUnaryExpression(
            operatorKind,
            operatorToken,
            operand
        )
    }

    private parseMemoryCommand(nameToken: Token, kind: SyntaxKind): MemoryCommand {
        const dataRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const commaToken = this.syntaxTokens.eatToken(SyntaxKind.CommaToken)
        const memoryOffsetToken = this.syntaxTokens.eatToken(SyntaxKind.NumericLiteralToken)
        const openParenToken = this.syntaxTokens.eatToken(SyntaxKind.OpenParenToken)
        const memoryRegisterToken = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        const closeParenToken = this.syntaxTokens.eatToken(SyntaxKind.CloseParenToken)

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

    private parseJumpRegisterPseudoCommand(nameToken: Token): JumpRegisterPseudoCommand {
        const returnRegister = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        return new JumpRegisterPseudoCommand(
            nameToken,
            returnRegister
        )
    }

    private parseCallPseudoCommand(nameToken: Token): CallPseudoCommand {
        const functionName = this.syntaxTokens.eatToken(SyntaxKind.Identifier)
        return new CallPseudoCommand(
            nameToken,
            functionName,
        )
    }
}
