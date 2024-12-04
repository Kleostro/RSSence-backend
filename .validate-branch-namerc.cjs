module.exports = {
  errorMsg: 'Please use correct branch name',
  pattern: /develop|^(feat|fix|hotfix|chore|refactor|revert|docs|style|test|)\/RS-0[1-9]-\d{2}\/[a-zA-Z0-9-]+$/,
};

// Branch Name Examples:

// "feat/RS-01-01/add-login-form" // where 01 is the sprint number and 01 is the issue number
// "fix/RS-02-03/fix-router" // where 02 is the sprint number and 03 is the issue number
