import { Token } from "./token";

export class Label {
    readonly nameToken: Token;
    readonly openParen: Token;
    readonly closeParen: Token;
    readonly colon: Token;
    readonly address: number;

    constructor(name: Token, openParen: Token, closeParen: Token, colon: Token, address: number) {
        this.nameToken = name;
        this.openParen = openParen
        this.closeParen = closeParen
        this.colon = colon
        this.address = address;
    }
}
