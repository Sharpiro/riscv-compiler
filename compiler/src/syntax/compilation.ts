import { Command } from "./addCommandSyntax";
import { Label } from "./label";

export interface Compilation {
    readonly commands: Command[],
    readonly labels: { [key: string]: Label }
}
