export class Command {
    name = ""

    constructor(partial?: Partial<Command>) {
        Object.assign(this, partial)
    }
}

export class AddCommand extends Command {
    sourceRegisterOne = 0
    sourceRegisterTwo = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddCommand>) {
        super()
        Object.assign(this, partial)
    }
}

export class AddImmediateCommand extends Command {
    sourceRegisterOne = 0
    constantValue = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddImmediateCommand>) {
        super()
        Object.assign(this, partial)
    }
}