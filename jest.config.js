module.exports = {
    testTimeout: 30000,
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions:['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node', 'd', 'd.ts'],
    testMatch: [
        '**/src/core/**/*.test.ts',
        '**/src/middlewares/**/*.test.ts',
        '**/src/app/**/*.test.ts',
        '**/src/services/**/*.test.ts',
        '**/src/util/**/*.test.ts'
    ],
   
};