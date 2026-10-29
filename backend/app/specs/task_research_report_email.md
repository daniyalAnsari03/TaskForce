# Task Type Spec - Research, Report and Email

## Example goal
"Research Competitor X, make a report and email it to my boss."

## Agents involved
Manager, Researcher, Writer, Reviewer. (The Coder is used only if the Code tool is enabled and the goal needs data work.)

## Flow
1. Manager reads the goal and the enabled tools, then writes a plan.
2. Researcher searches the web and returns a sourced summary.
3. Writer creates report.pdf (and data.xlsx if needed) from the research, and prepares an email draft with the files attached. The Writer does NOT send yet.
4. Reviewer checks the report and the email draft against the goal and returns pass or fail.
5. If fail: Manager sends the work back to the responsible agent (limited rounds, TBD).
6. If pass: Writer calls send_email. The backend pauses and creates an approval request.
7. User approves or rejects. On approve the email is sent. On reject it is skipped and recorded.
8. Manager writes the final summary into tasks.summary and the task ends as Completed.

## Inputs from the user
- Goal text.
- Enabled tools: web search, files, code, email.
- require_approval setting.

## Final outputs
- report.pdf, and data.xlsx when needed, saved in storage.
- Summary in tasks.summary.
- Email sent (if approved) or recorded as rejected.

## What done looks like
- Files exist and are downloadable on the Result page.
- Reviewer verdict is pass.
- Email is either sent after approval or clearly marked rejected.

## Failure cases
- Researcher finds nothing reliable: Writer reports "not found" instead of inventing content.
- A tool fails twice: that step is marked failed and the task ends as Failed with a clear error message.
- User rejects the email: task still completes, with a note that the email was not sent.

## Open items
- Maximum revision rounds after a Reviewer fail: TBD
- Decision (confirmed by owner): the Reviewer runs before any irreversible action (email). The Manager and Writer specs were updated to match.
