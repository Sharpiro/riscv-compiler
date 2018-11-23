import { Token, SyntaxKind } from "./token";

export class SyntaxNode {
    kind: SyntaxKind

    constructor(kind: SyntaxKind) {
        this.kind = kind
    }

    get kindText(): string {
        return SyntaxKind[this.kind]
    }
}

export abstract class Command extends SyntaxNode {
    nameToken: Token
    address = 0

    constructor(name: Token, kind: SyntaxKind) {
        super(kind);
        this.nameToken = name
    }
}

export abstract class DoubleParameterCommand extends Command {
    firstCommaToken: Token

    constructor(name: Token, kind: SyntaxKind, firstCommaToken: Token) {
        super(name, kind)
        this.firstCommaToken = firstCommaToken
    }
}

export abstract class TripleParameterCommand extends DoubleParameterCommand {
    secondCommaToken: Token

    constructor(name: Token, kind: SyntaxKind, firstCommaToken: Token, secondCommaToken: Token) {
        super(name, kind, firstCommaToken)
        this.secondCommaToken = secondCommaToken
    }
}

export class AddCommand extends TripleParameterCommand {
    sourceRegisterOneToken: Token
    sourceRegisterTwoToken: Token
    destinationRegisterToken: Token

    constructor(nameToken: Token, firstCommaToken: Token,
        secondCommaToken: Token, sourceRegisterOneToken: Token,
        sourceRegisterTwoToken: Token, destinationRegisterToken: Token) {
        super(nameToken, SyntaxKind.AddCommand, firstCommaToken, secondCommaToken);
        this.sourceRegisterOneToken = sourceRegisterOneToken
        this.sourceRegisterTwoToken = sourceRegisterTwoToken
        this.destinationRegisterToken = destinationRegisterToken
    }
}

export class AddImmediateCommand extends TripleParameterCommand {
    sourceRegisterToken: Token
    expression: Expression
    destinationRegisterToken: Token

    constructor(nameToken: Token, firstCommaToken: Token,
        secondCommaToken: Token, sourceRegisterToken: Token,
        expression: Expression, destinationRegisterToken: Token) {
        super(nameToken, SyntaxKind.AddImmediateCommand, firstCommaToken, secondCommaToken);
        this.sourceRegisterToken = sourceRegisterToken
        this.expression = expression
        this.destinationRegisterToken = destinationRegisterToken
    }
}

export class Expression extends SyntaxNode {
    constructor(kind: SyntaxKind) {
        super(kind);
    }
}

export class PrefixUnaryExpression extends Expression {
    operatorToken: Token
    operand: Token

    constructor(kind: SyntaxKind, operatorToken: Token, operand: Token) {
        super(kind);
        this.operatorToken = operatorToken
        this.operand = operand
    }
}

export class MemoryCommand extends DoubleParameterCommand {
    dataRegisterToken: Token
    memoryOffsetToken: Token
    openParenToken: Token
    memoryRegisterToken: Token
    closeParenToken: Token

    constructor(nameToken: Token, kind: SyntaxKind, commaToken: Token,
        dataRegisterToken: Token, memoryOffsetToken: Token,
        memoryRegisterToken: Token, openParenToken: Token,
        closeParenToken: Token) {
        super(nameToken, kind, commaToken);
        this.dataRegisterToken = dataRegisterToken
        this.memoryOffsetToken = memoryOffsetToken
        this.memoryRegisterToken = memoryRegisterToken
        this.openParenToken = openParenToken
        this.closeParenToken = closeParenToken
    }
}

// export class JumpAndLinkRegisterCommand extends Command {
//     // unknownRegisterToken: Token
//     returnRegisterToken: Token
//     offsetToken: Token

//     constructor(nameToken: Token, commaToken: Token,
//         dataRegisterToken: Token, memoryOffsetToken: Token,
//         memoryRegisterToken: Token, openParenToken: Token,
//         closeParenToken: Token) {
//         super(nameToken, SyntaxKind.JumpAndLinkRegisterCommand, commaToken);
//         this.dataRegisterToken = dataRegisterToken
//         this.memoryOffsetToken = memoryOffsetToken
//         this.memoryRegisterToken = memoryRegisterToken
//         this.openParenToken = openParenToken
//         this.closeParenToken = closeParenToken
//     }
// }

// export class JumpAndLinkCommand extends Command {
//     returnRegister = 0
//     procedureAddress = 0

//     constructor(partial?: Partial<JumpAndLinkCommand>) {
//         super();
//         Object.assign(this, partial)
//     }
// }
