/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          esModuleInterop: true,
          target: "es2022",
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
};
