export class Registers {
    private _registers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    get registers(): number[] {
        return this._registers.slice()
    }

    get(index: number): number {
        if (index < 0 || index > 31) {
            throw new Error(`invalid register index '${index}', must be 0 <= x <= 31`)
        }
        return this._registers[index]
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
}
