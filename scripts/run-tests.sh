#!/bin/bash
set -e

# Find all test files and run them with Node.js
find src -name '*.test.ts' -print0 | while IFS= read -r -d '' test_file; do
  echo
  echo
  echo "Executing test file: $test_file"
  tsx -r dotenv/config "$test_file"
done 