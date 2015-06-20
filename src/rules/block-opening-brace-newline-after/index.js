import {
  hasBlock,
  hasEmptyBlock,
  report,
  ruleMessages,
  whitespaceChecker
} from "../../utils"

export const ruleName = "block-opening-brace-newline-after"

export const messages = ruleMessages(ruleName, {
  expectedAfter: () => `Expected newline after "{"`,
  rejectedAfter: () => `Unexpected space after "{"`,
  expectedAfterMultiLine: () => `Expected newline after "{" of a multi-line block`,
  rejectedAfterMultiLine: () => `Unexpected space after "{" of a multi-line block`,
})

/**
 * @param {"always"|"never"|"always-multi-line"|"never-multi-line"} expectation
 */
export default function (expectation) {
  const checker = whitespaceChecker("\n", expectation, messages)

  return function (css, result) {

    // Check both kinds of statement: rules and at-rules
    css.eachRule(check)
    css.eachAtRule(check)

    function check(statement) {

      // Return early if blockless or has empty block
      if (!hasBlock(statement) || hasEmptyBlock(statement)) { return }

      const firstNode = statement.first
      if (!firstNode) { return }

      // Allow an end-of-line comment one space after the brace
      const nodeToCheck = (firstNode.type === "comment" && firstNode.before === " ")
        ? firstNode.next()
        : firstNode

      // The string to check for multi-line vs single-line is the block:
      // the curly braces and everything between them
      const lineCheckStr = (statement.type === "rule")
        ? statement.toString().slice((statement.selector + statement.between).length)
        : statement.toString().slice(
            ("@" + statement.name + statement.afterName + statement.params + statement.between).length
          )

      checker.afterOneOnly(nodeToCheck.toString(), -1, m => report({
        message: m,
        node: nodeToCheck,
        result,
        ruleName,
      }), lineCheckStr)
    }
  }
}
