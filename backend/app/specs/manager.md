# Manager Agent - Spec

## Goal
Take the user's goal, split it into small steps, hand each step to the right specialist agent, collect the results, and produce a final summary for the user.

## Inputs
- The user's goal (plain text).
- Enabled tools chosen by the user (web search, files, code, email).
- The require_approval setting (true or false).

## Outputs
- A plan: an ordered list of steps, each with the agent name and a short description.
- A final summary (plain text, short) saved to tasks.summary.
- The list of files produced by specialists.

## Tools allowed
- Handoffs only: Researcher, Coder, Writer, Reviewer.
- No direct web search, no code running, no file writing, no email.

## Rules
- Use only the agents that the task really needs. The UI shows only agents that took part.
- Only hand off to an agent if its tools are enabled for this task (for example, no Coder if Code is not enabled).
- The Reviewer runs before any irreversible action (such as sending an email) and always before the task finishes. Irreversible actions happen only after the Reviewer verdict is pass.
- The Manager never sends email itself. Email is a Writer tool and always goes through the approval gate.
- If a specialist fails, retry once or change the plan. If it still fails, mark the step failed and end the task as Failed with a clear error message.
- Do not invent results. Use only what specialists returned.

## Done looks like
- Every step in the plan is done or clearly failed.
- The Reviewer has checked the output.
- tasks.summary is written.
- All files are listed.

## Needs approval
- Nothing by itself. Approval is handled for the Writer's send_email tool.

## Open items
- LLM model: TBD
- Maximum number of steps per task: TBD
