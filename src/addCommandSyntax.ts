export interface Command {
    name: string
}

export class AddCommand implements Command {
    readonly name = "add"
    sourceRegisterOne = 0
    sourceRegisterTwo = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddCommand>) {
        Object.assign(this, partial)
    }
}

export class AddImmediateCommand implements Command {
    readonly name = "addi"
    sourceRegister = 0
    constantValue = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddImmediateCommand>) {
        Object.assign(this, partial)
    }
}

export class MemoryCommand implements Command {
    name = "sw"
    type: MemoryCommandType
    dataRegister = 0
    memoryOffset = 0
    memoryRegister = 0

    constructor(partial?: Partial<MemoryCommand>) {
        Object.assign(this, partial)
    }
}

export type MemoryCommandType = "store" | "load" | undefined

// export class StoreWordCommand extends Command {
//     name = "sw"
//     dataRegister = 0
//     memoryOffset = 0
//     memoryRegister = 0

//     constructor(partial?: Partial<StoreDoubleWordCommand>) {
//         super()
//     }
// }

// export class StoreDoubleWordCommand extends Command {
//     name = "sd"
//     dataRegister = 0
//     memoryOffset = 0
//     memoryRegister = 0

//     constructor(partial?: Partial<StoreDoubleWordCommand>) {
//         super()
//     }
// }

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
