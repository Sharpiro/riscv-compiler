import { Token } from "./token";

export class Label {
    readonly nameToken: Token;
    readonly address: number;
    constructor(name: Token, address: number) {
        this.nameToken = name;
        this.address = address;
    }
}
