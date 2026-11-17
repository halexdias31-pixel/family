"""The `spec` stage's bridge to a transcription module (tools/content.js): runs one module and prints its rows as JSON.

    python3 tools/content/emit.py <module.py>

A module is a paper (or a set of papers) transcribed in Python. Its rows are whichever it exposes: `ROWS` (a list),
`MONTH.rows()` (the Corbettmaths months), or `P.rows()` (a tools/content/paper.py Paper). It writes nothing; what it
prints while it runs goes to stderr so stdout is only the rows.
"""
import contextlib
import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
src = pathlib.Path(sys.argv[1]).resolve()
sys.argv = [str(src)]
for p in (HERE.parent, HERE, src.parent):
    sys.path.insert(0, str(p))
spec = importlib.util.spec_from_file_location(src.stem.replace('-', '_'), src)
m = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(sys.stderr):
    spec.loader.exec_module(m)
    if hasattr(m, 'ROWS'):
        rows = m.ROWS
    elif hasattr(m, 'MONTH'):
        rows = m.MONTH.rows()
    elif hasattr(m, 'P'):
        rows = m.P.rows()
    else:
        raise SystemExit('%s exposes no ROWS, MONTH or P' % src)
json.dump(rows, sys.stdout, ensure_ascii=False)
