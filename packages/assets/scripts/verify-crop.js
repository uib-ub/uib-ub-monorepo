// Verify no asset is cropped: the artwork visible within the SOURCE
// (staged) viewBox must fit inside the FINAL viewBox.
//
// inkscape --query-* reports the GEOMETRIC bbox of all objects relative
// to the viewBox origin — including fill="none" geometry that paints
// nothing. To get the painted artwork, first materialize style-based
// fills (inlineStyles + convertStyleToAttrs, like the pipeline does) and
// strip unpainted drawing elements.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const { optimize } = require("svgo");

const assetsDir = "src/assets";
const stageDir = ".cache/stage";
const tmpDir = path.join(os.tmpdir(), "verify-crop");
fs.mkdirSync(tmpDir, { recursive: true });

function parseViewBox(svg) {
  const m = svg.match(/viewBox="([^"]*)"/);
  if (!m) return null;
  const n = m[1].trim().split(/[\s,]+/).map(Number);
  return n.length === 4 && n.every(Number.isFinite) ? n : null;
}

/** Materialize style fills, drop fixed sizes (so inkscape's document px
 * equal viewBox user units) and strip unpainted (fill="none") geometry. */
function paintedSvg(svg) {
  const normalized = optimize(svg, {
    plugins: [
      { name: "inlineStyles", params: { onlyMatchedOnce: false } },
      "convertStyleToAttrs",
      "removeDimensions",
    ],
  }).data;
  return normalized.replace(/<(?:path|rect|circle|ellipse|line|polyline|polygon)\b[^>]*fill="none"[^>]*\/>/g, "");
}

function query(svg, key) {
  const file = path.join(tmpDir, `${key}.svg`);
  fs.writeFileSync(file, paintedSvg(svg));
  const out = execSync(
    `inkscape ${JSON.stringify(file)} --query-x --query-y --query-width --query-height`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  const n = out.trim().split(/\s+/).map(Number);
  return { x: n[0], y: n[1], w: n[2], h: n[3] };
}

const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".svg"));
const problems = [];
for (const f of files) {
  const name = f.replace(/\.svg$/, "");
  const finalSvg = fs.readFileSync(path.join(assetsDir, f), "utf8");
  const vb = parseViewBox(finalSvg);
  if (!vb) {
    problems.push([name, "no viewBox"]);
    continue;
  }
  const fq = query(finalSvg, `${name}-final`);
  // Painted artwork bbox in final user coordinates
  const art = { x: vb[0] + fq.x, y: vb[1] + fq.y, w: fq.w, h: fq.h };

  // The artwork visible in the source = staged artwork ∩ staged viewBox
  const stagePath = path.join(stageDir, f);
  let visible = art;
  let note = "";
  if (fs.existsSync(stagePath)) {
    const stagedSvg = fs.readFileSync(stagePath, "utf8");
    const svb = parseViewBox(stagedSvg);
    if (svb) {
      const sq = query(stagedSvg, `${name}-staged`);
      const sart = { x: svb[0] + sq.x, y: svb[1] + sq.y, w: sq.w, h: sq.h };
      const x1 = Math.max(sart.x, svb[0]);
      const y1 = Math.max(sart.y, svb[1]);
      const x2 = Math.min(sart.x + sart.w, svb[0] + svb[2]);
      const y2 = Math.min(sart.y + sart.h, svb[1] + svb[3]);
      visible =
        x2 > x1 && y2 > y1 ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
    }
  } else {
    note = " (local org, no staged source)";
  }
  if (!visible) {
    console.log(`${name}: no visible artwork in source${note}`);
    continue;
  }

  const tol = 1.0;
  const overflows = [];
  if (visible.x < vb[0] - tol) overflows.push(`left by ${(vb[0] - visible.x).toFixed(2)}`);
  if (visible.y < vb[1] - tol) overflows.push(`top by ${(vb[1] - visible.y).toFixed(2)}`);
  if (visible.x + visible.w > vb[0] + vb[2] + tol)
    overflows.push(`right by ${(visible.x + visible.w - vb[0] - vb[2]).toFixed(2)}`);
  if (visible.y + visible.h > vb[1] + vb[3] + tol)
    overflows.push(`bottom by ${(visible.y + visible.h - vb[1] - vb[3]).toFixed(2)}`);
  if (overflows.length) problems.push([name, overflows.join(", ") + note]);
}

if (problems.length) {
  console.log("CROPPED:");
  for (const [name, why] of problems) console.log(`  ${name}: ${why}`);
  process.exit(1);
}
console.log(`all ${files.length} assets OK (visible artwork fits the final viewBox)`);
