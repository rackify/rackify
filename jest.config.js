module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: [ '<rootDir>/tests/**/*.test.[jt]s?(x)', '<rootDir>/packages/**/src/__tests__/*.test.[jt]s?(x)' ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts']
};
