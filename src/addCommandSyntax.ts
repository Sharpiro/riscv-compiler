export class Command {
    name = ""

    constructor(partial?: Partial<Command>) {
        Object.assign(this, partial)
    }
}

export class AddCommand extends Command {
    readonly name = "add"
    sourceRegisterOne = 0
    sourceRegisterTwo = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddCommand>) {
        super()
        Object.assign(this, partial)
    }
}

export class AddImmediateCommand extends Command {
    readonly name = "addi"
    sourceRegisterOne = 0
    constantValue = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddImmediateCommand>) {
        super()
        Object.assign(this, partial)
    }
}

export class StoreWordCommand extends Command {
    readonly name = "sw"
    sourceRegister = 0
    offset = 0
    destinationRegister = 0

    constructor(partial?: Partial<StoreDoubleWordCommand>) {
        super()
        Object.assign(this, partial)
    }
}

export class StoreDoubleWordCommand extends Command {
    readonly name = "sd"
    sourceRegister = 0
    offset = 0
    destinationRegister = 0

    constructor(partial?: Partial<StoreDoubleWordCommand>) {
        super()
        Object.assign(this, partial)
    }
}