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

export class StoreCommand extends Command {
    name = "sw"
    dataRegister = 0
    memoryOffset = 0
    memoryRegister = 0

    constructor(partial?: Partial<StoreCommand>) {
        super()
        Object.assign(this, partial)
    }
}

export class StoreWordCommand extends Command {
    name = "sw"
    dataRegister = 0
    memoryOffset = 0
    memoryRegister = 0

    constructor(partial?: Partial<StoreDoubleWordCommand>) {
        super()
        Object.assign(this, partial)
    }
}

export class StoreDoubleWordCommand extends Command {
    name = "sd"
    dataRegister = 0
    memoryOffset = 0
    memoryRegister = 0

    constructor(partial?: Partial<StoreDoubleWordCommand>) {
        super()
        Object.assign(this, partial)
    }
}

// export class LoadWordCommand extends Command {
//     readonly name = "lw"
//     sourceRegister = 0
//     offset = 0
//     destinationRegister = 0

//     constructor(partial?: Partial<StoreDoubleWordCommand>) {
//         super()
//         Object.assign(this, partial)
//     }
// }
