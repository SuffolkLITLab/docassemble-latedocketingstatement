# Enter a Massachusetts civil appeal late

A guided interview for a self-represented civil appellant who filed a notice of appeal and received a notice of assembly, but missed the deadline to enter the appeal in the Massachusetts Appeals Court. It produces a motion, supporting affidavit, certificate of service, and filing instructions. Optional supporting documents can be attached. Users print and sign the papers.

This is not a late notice of appeal or late Civil Docketing Statement. Criminal cases and appeals already dismissed by the trial court are outside its scope. A pending dismissal motion triggers a warning about the order of steps. The interview does not file papers. Fee-waiver papers are prepared separately; the instructions link the published affidavit-of-indigency interview and explain the additional fee-waiver motion.

Entry point: `docassemble.latedocketingstatement:data/questions/late_docketing_statement.yml`.

## Verification

Run output regression checks with:

```sh
uv run --with docxtpl --with pytest pytest tests
```

Three scenarios in `data/sources/late_docketing.feature` use only built-in ALKiln 5 steps. They cover an unserved motion without an Appeals Court number, service on multiple recipients with a pending dismissal motion and an exhibit, and a person who needs a different procedure. They check answers and download the resulting PDFs. Use the standard [ALKiln setup and testing instructions](https://suffolklitlab.org/docassemble-AssemblyLine-documentation/docs/alkiln/intro) to run them.

Also check exhibit removal by hand: finish the served scenario with its one-page exhibit, download the combined packet, choose **Make changes**, edit supporting documents to **No**, and return to download. The exhibit download must disappear and the new packet must have one fewer page. Native ALKiln steps cannot compare page counts or download the same filename twice in one scenario. The earlier successful custom-helper run is historical evidence, not a claim that the current native suite automates this check.

Automated checks and research do not substitute for attorney or publication approval. Review evidence is in `publication-evidence.json`.

Original student author contact: racosta2@su.suffolk.edu.

The Appeals Court's single-justice guidance controls the procedure and fee. For accessible background, the interview links MassLegalHelp's [fee-waiver instructions](https://www.masslegalhelp.org/courts-hearings-language-rights/courts-massachusetts/how-fill-out-affidavit-indigency) and [legal-help directory](https://www.masslegalhelp.org/find-lawyer).
