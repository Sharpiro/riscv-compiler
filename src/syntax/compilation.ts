import { Command } from "../addCommandSyntax";
import { Label } from "./label";
export class Compilation {
    readonly commands: Command[];
    readonly labels: {
        [key: string]: Label;
    };
    constructor(commands: Command[], labels: {
        [key: string]: Label;
    }) {
        this.commands = commands;
        this.labels = labels;
    }
}
