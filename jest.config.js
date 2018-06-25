
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
    reporters: [ "default", [ "jest-junit", { output: "tests/reports/unit/junit.xml" } ] ],
    coverageDirectory: 'tests/reports/coverage',
    coverageReporters: [
        "cobertura"
    ]
};