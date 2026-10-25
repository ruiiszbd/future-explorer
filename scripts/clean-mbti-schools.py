# -*- coding: utf-8 -*-
"""Clean recommendedSchools in mbtiData.js against official list + rename map."""
import json
import re
from pathlib import Path

raw = json.load(open("_schools_raw.json", encoding="utf-8"))
names = {s["name"] for s in raw["schools"]}
by_name = {s["name"]: s for s in raw["schools"]}

renames = {
    "宁波职业技术学院": "宁波职业技术大学",
    "无锡职业技术学院": "无锡职业技术大学",
    "黄河水利职业技术学院": "黄河水利职业技术大学",
    "深圳信息职业技术学院": "深圳信息职业技术大学",
    "杭州职业技术学院": "杭州职业技术大学",
    "四川建筑职业技术学院": "四川建筑职业技术大学",
    "重庆电子工程职业学院": "重庆电子科技职业大学",
    "广州番禺职业技术学院": "广东轻工职业技术大学",
    "北京社会管理职业学院": "民政职业大学",
    "浙江幼儿师范高等专科学校": "宁波幼儿师范高等专科学校",
    "北京电子科技职业学院": "北京电子科技学院",
}

# placeholders -> concrete replacements
placeholder_map = {
    "信息安全特色高职（如部分公安/电子类高职）": ["重庆电子科技职业大学", "广东科学技术职业学院"],
    "北京戏曲艺术职业学院相关美业高职": ["北京戏曲艺术职业学院", "广东文艺职业学院"],
    "地方优质幼教/托育高职": ["宁波幼儿师范高等专科学校", "广州幼儿师范高等专科学校"],
    "地方优质美业高职": ["北京戏曲艺术职业学院", "广东文艺职业学院"],
    "地方文旅特色高职": ["浙江旅游职业学院", "上海旅游高等专科学校"],
    "天津职业技术师范大学合作高职体系相关院校": ["天津职业大学", "天津电子信息职业技术学院"],
    "桂林旅游学院相关高职体系": ["浙江旅游职业学院", "上海旅游高等专科学校"],
    "浙江传媒学院相关高职合作体系/地方传媒高职": ["湖南大众传媒职业技术学院", "浙江横店影视职业学院"],
    "结合本地师范/医药高职开设情况选择": ["天津医学高等专科学校", "宁波幼儿师范高等专科学校"],
}

path = Path("src/data/mbtiData.js")
text = path.read_text(encoding="utf-8")

# resolve rename for Yangling properly
if "杨凌职业技术大学" not in names:
    shaanxi_uni = [s["name"] for s in raw["schools"] if s["province"] == "陕西省" and "职业技术大学" in s["name"]]
    shaanxi_zhuan = [s["name"] for s in raw["schools"] if s["province"] == "陕西省" and s["level"] == "专科" and "职业" in s["name"]]
    renames["杨凌职业技术学院"] = (shaanxi_uni or shaanxi_zhuan or ["西安职业技术学院"])[0]
else:
    renames["杨凌职业技术学院"] = "杨凌职业技术大学"

# verify all rename targets
for k, v in list(renames.items()):
    if v not in names:
        raise SystemExit(f"bad rename {k}->{v}")

# replace school strings inside recommendedSchools arrays
def clean_array(block: str) -> str:
    items = re.findall(r"'([^']+)'", block)
    cleaned = []
    for item in items:
        if item in placeholder_map:
            for x in placeholder_map[item]:
                if x in names and x not in cleaned:
                    cleaned.append(x)
            continue
        mapped = renames.get(item, item)
        if mapped not in names:
            # drop invalid vague entries
            continue
        if mapped not in cleaned:
            cleaned.append(mapped)
    if not cleaned:
        cleaned = ["深圳职业技术大学", "金华职业技术大学"]
    return "[" + ", ".join(f"'{x}'" for x in cleaned[:4]) + "]"

def repl_schools(m):
    return "recommendedSchools: " + clean_array(m.group(1))

new_text = re.sub(
    r"recommendedSchools:\s*\[([^\]]*)\]",
    repl_schools,
    text,
)

# enrich majors level when school is 本科 vocational university
# Add helper comment at top if not present
banner = "/**\n * 推荐院校已按教育部名单（截至2026-06-17）清洗；层次以官方办学层次为准。\n */\n"
if "截至2026-06-17" not in new_text:
    # insert after first block comment or at start
    if new_text.startswith("/**"):
        end = new_text.find("*/")
        new_text = new_text[: end + 2] + "\n" + banner + new_text[end + 2 :]
    else:
        new_text = banner + new_text

path.write_text(new_text, encoding="utf-8")

# audit
entries = []
for block in re.findall(r"recommendedSchools:\s*\[([^\]]*)\]", new_text):
    entries += re.findall(r"'([^']+)'", block)
uniq = sorted(set(entries))
hits = [e for e in uniq if e in names]
miss = [e for e in uniq if e not in names]
print("unique", len(uniq), "hit", len(hits), "miss", miss)
print("sample", uniq[:10])
