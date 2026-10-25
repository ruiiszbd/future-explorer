# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

raw = json.load(open("_schools_raw.json", encoding="utf-8"))
names = {s["name"] for s in raw["schools"]}
text = Path("src/data/mbtiData.js").read_text(encoding="utf-8")
entries = []
for b in re.findall(r"recommendedSchools:\s*\[([^\]]*)\]", text):
    entries += re.findall(r"'([^']+)'", b)
uniq = sorted(set(entries))
miss = [e for e in uniq if e not in names]
Path("_verify_out.txt").write_text(
    f"count={len(uniq)}\nmiss={miss}\n" + "\n".join(uniq),
    encoding="utf-8",
)
print("ok" if not miss else "FAIL", len(uniq), len(miss))
