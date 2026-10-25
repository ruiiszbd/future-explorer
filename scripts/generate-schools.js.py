# -*- coding: utf-8 -*-
import json
import os

data = json.load(open("_schools_raw.json", encoding="utf-8"))
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
}
names = {s["name"] for s in data["schools"]}
missing = [(k, v) for k, v in renames.items() if v not in names]
if missing:
    raise SystemExit(f"rename targets missing: {missing}")

# also verify 民政职业大学
assert "民政职业大学" in names

parts = []
parts.append("/**")
parts.append(" * 全国普通高等学校名单（截至2026年6月17日）")
parts.append(" * 数据来源：教育部公开名单 / 项目内院校名单.xls")
parts.append(f" * 共 {len(data['schools'])} 所")
parts.append(" */")
parts.append("")
parts.append('export const SCHOOL_LIST_AS_OF = "2026-06-17"')
parts.append("")
parts.append(
    "export const schoolProvinces = "
    + json.dumps(data["provinces"], ensure_ascii=False, indent=2)
)
parts.append("")
parts.append("/**")
parts.append(
    ' * @typedef {{ name: string, code: string, supervisor: string, city: string, level: "本科"|"专科", note: string, province: string }} School'
)
parts.append(" */")
parts.append("")
parts.append("/** @type {School[]} */")
parts.append("export const schools = " + json.dumps(data["schools"], ensure_ascii=False))
parts.append("")
parts.append("/** 推荐文案中的旧校名 → 官方现用名 */")
parts.append(
    "export const schoolRenameMap = "
    + json.dumps(renames, ensure_ascii=False, indent=2)
)
parts.append("")
parts.append("export function getSchoolsByProvince(province) {")
parts.append("  if (!province) return schools")
parts.append("  return schools.filter((s) => s.province === province)")
parts.append("}")
parts.append("")
parts.append("export function findSchoolByName(name) {")
parts.append("  if (!name) return null")
parts.append("  const mapped = schoolRenameMap[name] || name")
parts.append(
    "  return schools.find((s) => s.name === mapped) || schools.find((s) => s.name === name) || null"
)
parts.append("}")
parts.append("")
parts.append("export function resolveSchoolName(name) {")
parts.append("  const hit = findSchoolByName(name)")
parts.append("  return hit ? hit.name : name")
parts.append("}")
parts.append("")
parts.append("export function schoolLevelLabel(level) {")
parts.append('  if (level === "本科") return "本科（含职业本科）"')
parts.append('  if (level === "专科") return "专科"')
parts.append('  return level || "未知层次"')
parts.append("}")
parts.append("")

os.makedirs("src/data", exist_ok=True)
path = os.path.join("src", "data", "schools.js")
with open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(parts))
print("wrote", path, "bytes", os.path.getsize(path))
