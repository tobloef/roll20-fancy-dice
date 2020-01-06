export function testString(pattern, str) {
    if (typeof pattern === "string") {
        return str.includes(pattern);
    } else {
        return pattern.test(str);
    }
}