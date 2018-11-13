export abstract class Command {
    name = ""
    address = 0
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
    }
}

export type MemoryCommandType = "store" | "load" | undefined

export class JumpRegisterCommand extends Command {
    returnRegister = 0

    constructor(partial?: Partial<JumpRegisterCommand>) {
        super();
        Object.assign(this, partial)
        this.name = "jr"
    }
}

export class JumpAndLinkCommand extends Command {
    returnRegister = 0
    procedureAddress = 0

    constructor(partial?: Partial<JumpAndLinkCommand>) {
        super();
        Object.assign(this, partial)
        this.name = "jal"
    }
}

// export class CallCommand extends Command {
//     readonly returnRegister = 1

//     constructor(partial?: Partial<JumpRegisterCommand>) {
//         super();
//         Object.assign(this, partial)
//         this.name = "call"
//     }
// }

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
