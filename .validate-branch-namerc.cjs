module.exports = {
  errorMsg: 'Please use correct branch name',
  pattern: /^(ci|chore|docs|feat|fix|perf|refactor|style|test)\/RS-0[1-9]-\d{2}\/[a-z_]+$/,
};

// Branch Name Examples:

// "feat/RS-01-01/add-login-form" // where 01 is the sprint number and 01 is the issue number
// "fix/RS-02-03/fix-router" // where 02 is the sprint number and 03 is the issue number

// more info here https://www.conventionalcommits.org/en/v1.0.0/

// ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
// chore: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
// docs: Documentation only changes
// feat: A new feature
// fix: A bug fix
// perf: A code change that improves performance
// refactor: A code change that neither fixes a bug nor adds a feature
// style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
// test: Adding missing tests or correcting existing tests
