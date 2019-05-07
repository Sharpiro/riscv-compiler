export class Registers {
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
