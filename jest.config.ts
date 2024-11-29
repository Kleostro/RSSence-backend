import type { Config } from 'jest';

const config: Config = {
  moduleDirectories: ['node_modules', '<rootDir>'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  clearMocks: true,
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts', '!src/index.tsx'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/dist/', 'dist'],
};

export default config;
