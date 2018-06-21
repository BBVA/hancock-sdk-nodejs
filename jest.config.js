
module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!**/node_modules/**",
        "!**/*.d.ts"
    ],
    // coverageReporters: [
    //     "json",
    //     "lcov",
    //     "text",
    //     "cobertura"
    //   ]
};