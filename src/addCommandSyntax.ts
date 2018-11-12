// export interface Command {
//     name: string
//     address: number
// }

export abstract class Command {
    name = ""
    address = 0

    constructor() {
        var x = 5;
    }
}

export class AddCommand extends Command {
    sourceRegisterOne = 0
    sourceRegisterTwo = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddCommand>) {
        super();
        Object.assign(this, partial)
        this.name = "add"
    }
}

export class AddImmediateCommand extends Command {
    sourceRegister = 0
    constantValue = 0
    destinationRegister = 0

    constructor(partial?: Partial<AddImmediateCommand>) {
        super();
        Object.assign(this, partial)
        this.name = "addi"
    }
}

export class MemoryCommand extends Command {
    type: MemoryCommandType
    dataRegister = 0
    memoryOffset = 0
    memoryRegister = 0

    constructor(partial?: Partial<MemoryCommand>) {
        super();
        Object.assign(this, partial)
        // this.name = "sw"
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
