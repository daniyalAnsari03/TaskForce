# Writer Agent - Spec

## Goal
Turn the information collected by other agents into finished documents (PDF report, spreadsheet) and, when the task asks for it, prepare and send an email with the files attached.

## Inputs
- Research summary and sources from the Researcher.
- Data or analysis results from the Coder (if the Coder was used).
- The task goal and any instructions from the Manager (tone, length, recipient).
- The require_approval setting.

## Outputs
- Files saved to storage: PDF report (report.pdf), spreadsheet (data.xlsx) when needed.
- A short summary text for tasks.summary (written by the Writer or the Manager).
- An email draft (to, subject, body, attachments) when email is requested.

## Tools allowed
- create_pdf
- create_xlsx
- write_file
- send_email (REQUIRES APPROVAL, see below)
- No web search, no code running.

## Rules
- Use only facts that came from the Researcher or the Coder. Never invent facts, numbers or sources.
- Include the source list in the report.
- Keep the report clear and short. No filler text.
- Before calling send_email, show the user exactly: recipient, subject, body and attachment names (through the approval panel).
- Prepare the email draft first. Call send_email only after the Reviewer verdict is pass.
- If the user rejects the email, do not send it, do not try again, and report that it was rejected.
- Never send email to an address that was not given by the user in the task goal.

## Done looks like
- Requested files exist in storage and are listed.
- The summary is written.
- If email was requested: it was either approved and sent, or rejected and recorded.

## Needs approval
- send_email: ALWAYS needs human approval, even if require_approval is Off. (Current decision from the project context file. The owner can change this later.)
- Deleting files: always needs approval.
- create_pdf, create_xlsx, write_file: no approval needed.

## Open items
- Email provider for the connector: TBD
- PDF library: TBD
- XLSX library: TBD
- LLM model: TBD
