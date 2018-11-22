import { Token } from "./token";

export abstract class Command {
    nameToken: Token
    address = 0

    constructor(name: Token) {
        this.nameToken = name
    }
}

export class AddCommand extends Command {
    sourceRegisterOneToken: Token
    sourceRegisterTwoToken: Token
    destinationRegisterToken: Token

    constructor(nameToken: Token, sourceRegisterOneToken: Token,
        sourceRegisterTwoToken: Token, destinationRegisterToken: Token) {
        super(nameToken);
        this.sourceRegisterOneToken = sourceRegisterOneToken
        this.sourceRegisterTwoToken = sourceRegisterTwoToken
        this.destinationRegisterToken = destinationRegisterToken
    }
}

export class AddImmediateCommand extends Command {
    sourceRegisterToken: Token
    numericConstantToken: Token
    destinationRegisterToken: Token

    constructor(nameToken: Token, sourceRegisterToken: Token,
        numericConstantToken: Token, destinationRegisterToken: Token) {
        super(nameToken);
        this.sourceRegisterToken = sourceRegisterToken
        this.numericConstantToken = numericConstantToken
        this.destinationRegisterToken = destinationRegisterToken
    }
}

export class Expression {

}

export class UnaryMinusExpression extends Expression {
    operatorToken: Token
    operand: Token

    constructor(operatorToken: Token, operand: Token) {
        super();
        this.operatorToken = operatorToken
        this.operand = operand
    }
}

export class NumericLiteralExpression extends Expression {
    token: Token

    constructor(token: Token) {
        super();
        this.token = token
    }
}

// export class MemoryCommand extends Command {
//     type: MemoryCommandType
//     dataRegister = 0
//     memoryOffset = 0
//     memoryRegister = 0

//     constructor(partial?: Partial<MemoryCommand>) {
//         super();
//         Object.assign(this, partial)
//     }
// }

// export type MemoryCommandType = "store" | "load" | undefined

// export class JumpAndLinkRegisterCommand extends Command {
//     unknownRegister = 0
//     returnRegister = 0
//     offset = 0

//     constructor(partial?: Partial<JumpAndLinkRegisterCommand>) {
//         super();
//         Object.assign(this, partial)
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
