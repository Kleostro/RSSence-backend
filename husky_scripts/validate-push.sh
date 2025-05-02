#!/bin/bash

BASIC_RED="\e[0;31m"
BASIC_GREEN="\e[0;32m"
BASIC_YELLOW="\e[0;33m"
BASIC_CYAN="\e[0;36m"
ENDCOLOR="\e[0m"

run_branch_name_validation () {
  echo -e "${BASIC_CYAN}🌿 Validating branch name${ENDCOLOR}"
  npx validate-branch-name
  if [[ $? -ne 0 ]]
  then
    echo -e "${BASIC_RED}❌ Branch name validation failed!${ENDCOLOR}"
    echo -e "${BASIC_YELLOW}⚠️ Please change your branch name to follow the required pattern.${ENDCOLOR}"
    exit 1
  fi
}

run_branch_name_validation

printf "${BASIC_GREEN}❤️‍🔥 The check has passed. Happy coding!${ENDCOLOR}\n"
