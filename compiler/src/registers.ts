export class Registers {
    private registerMap: { [name: string]: number } = {
        x0: 0,
        x1: 1,
        x2: 2,
        x3: 3,
        x4: 4,
        x5: 5,
        x6: 6,
        x7: 7,
        x8: 8,
        x9: 9,
        x10: 10,
        x11: 11,
        x12: 12,
        x13: 13,
        x14: 14,
        x15: 15,
        x16: 16,
        x17: 17,
        x18: 18,
        x19: 19,
        x20: 20,
        x21: 21,
        x22: 22,
        x23: 23,
        x24: 24,
        x25: 25,
        x26: 26,
        x27: 27,
        x28: 28,
        x29: 29,
        x30: 30,
        x31: 31,

        zero: 0, // zero
        ra: 1, // return address
        sp: 2, // stack pointer
        gp: 3, // global pointer
        tp: 4, // thread pointer
        t0: 5, // temp
        t1: 6, // temp
        t2: 7, // temp
        fp: 8, // saved register / frame pointer
        s0: 8, // saved register / frame pointer
        s1: 9, // saved register
        a0: 10, // function arg / return value
        a1: 11, // function args
        a2: 12, // function args
        a3: 13, // function args
        a4: 14, // function args
        a5: 15, // function args
        a6: 16, // function args
        a7: 17, // function args
        s2: 18, // saved registers
        s3: 19, // saved registers
        s4: 20, // saved registers
        s5: 21, // saved registers
        s6: 22, // saved registers
        s7: 23, // saved registers
        s8: 24, // saved registers
        s9: 25, // saved registers
        s10: 26, // saved registers
        s11: 27, // saved registers
        t3: 28, // temp
        t4: 29, // temp
        t5: 30, // temp
        t6: 31, // temp
    }
    private _registers = [
        0, -1, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]

    constructor(registers?: number[]) {
        if (registers) {
            this._registers = registers
        }
    }

    get registers(): number[] {
        return this._registers.slice()
    }

    getByName(registerName: string): number {
        const registerNumber = this.registerMap[registerName]
        if (registerNumber === undefined) {
            throw new Error(`'${registerName}' is not a valid register name`)
        }
        const value = this._registers[registerNumber]
        return value
    }

    setByName(registerName: string, value: number): void {
        const registerNumber = this.registerMap[registerName]
        if (registerNumber === undefined) {
            throw new Error(`'${registerName}' is not a valid register name`)
        }
        if (registerNumber === 0) {
            throw new Error(`register ${registerName} is constant and cannot be modified`)
        }
        this._registers[registerNumber] = value
    }

    get(index: number): number {
        if (index < 0 || index > 31) {
            throw new Error(`invalid register index '${index}', must be 0 <= x <= 31`)
        }
        const value = this._registers[index]
        if (value === undefined) {
            throw new Error(`An error occurred retrieving register number'${index}'`)
        }
        return value
    }

    set(index: number, value: number): void {
        if (index === 0) {
            throw new Error("register x0 is constant and cannot be modified")
        }
        if (index < 0 || index > 31) {
            throw new Error(`invalid register index '${index}', must be 0 <= x <= 31`)
        }
        this._registers[index] = value
    }

    copy() {
        return new Registers(this._registers.slice())
    }
}
