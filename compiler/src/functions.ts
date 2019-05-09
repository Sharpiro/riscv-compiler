export function prettyPrint<T>(enumerable: T[], prefix = "") {
    const fullPrefix = prefix == "" ? "" : `${prefix}: `
    console.log('\x1b[33m%s\x1b[0m', `${fullPrefix}[ ${enumerable.join(", ")} ]`)
}

export function redError<T>(message: string) {
    console.log('\x1b[31m%s\x1b[0m', message)
} 
