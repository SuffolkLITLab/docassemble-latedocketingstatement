# Enter a Massachusetts civil appeal late

A guided interview for a self-represented civil appellant who filed a notice of appeal and received a notice of assembly, but missed the deadline to enter the appeal in the Massachusetts Appeals Court. It produces a motion, supporting affidavit, certificate of service, and filing instructions. Optional supporting documents can be attached. Users print and sign the papers.

This is not a late notice of appeal or late Civil Docketing Statement. Criminal cases and appeals already dismissed by the trial court are outside its scope. A pending dismissal motion triggers a warning about the order of steps. The interview does not file papers. Fee-waiver papers are prepared separately; the instructions link the published affidavit-of-indigency interview and explain the additional fee-waiver motion.

Entry point: `docassemble.latedocketingstatement:data/questions/late_docketing_statement.yml`.

## Verification

Run output regression checks with:

```sh
uv run --with docxtpl --with pytest pytest tests
```

Three ALKiln scenarios cover an unserved motion without an Appeals Court number, service on multiple recipients with a pending dismissal motion, and a person who needs a different procedure. With the package installed on a local test server and local credentials configured:

```sh
python tests/run_alkiln.py .
```

The runner keeps credentials in memory and ignores local test artifacts. Automated checks and research do not substitute for attorney or publication approval. Review evidence is in `publication-evidence.json`.

Original student author contact: racosta2@su.suffolk.edu.
