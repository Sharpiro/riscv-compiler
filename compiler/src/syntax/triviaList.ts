import { TextSpan } from "../parser/textSpan";
import { Trivia } from "./trivia";

export class TriviaList {
    readonly trivia: Trivia[]
    readonly fullSpan: TextSpan

    get any(): boolean {
        return this.trivia.length > 0
    }

    get count(): number {
        return this.trivia.length
    }

    constructor(trivia: Trivia[] = []) {
        this.trivia = trivia

        const startingTrivia = trivia[0]
        const startingTriviaIndex = startingTrivia ? startingTrivia.fullSpan.start : 0
        const endingTrivia = trivia[trivia.length - 1]
        const endingTriviaIndex = endingTrivia ? endingTrivia.fullSpan.end : 0
        this.fullSpan = new TextSpan(startingTriviaIndex, endingTriviaIndex)
    }
}
