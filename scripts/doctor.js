/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const http = require("http");

const root = path.resolve(__dirname, "..");
const backendDir = path.join(root, "backend");
const frontendDir = path.join(root, "frontend");

function exists(filePath) {
  return fs.existsSync(filePath);
}

function checkEnvFile(filePath, requiredKeys) {
  if (!exists(filePath)) {
    return { ok: false, missing: requiredKeys.slice(), lines: [] };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));

  const keys = new Set(
    lines
      .map((line) => line.split("=")[0]?.trim())
      .filter(Boolean)
  );

  const missing = requiredKeys.filter((k) => !keys.has(k));
  return { ok: missing.length === 0, missing, lines };
}

function probe(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ ok: true, status: res.statusCode || 0 });
      res.resume();
    });
    req.setTimeout(2000, () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", () => resolve({ ok: false, status: 0 }));
  });
}

async function main() {
  let hasErrors = false;

  console.log("== Project Doctor ==");
  console.log(`Root: ${root}`);

  const backendPkg = path.join(backendDir, "package.json");
  const frontendPkg = path.join(frontendDir, "package.json");

  if (!exists(backendPkg)) {
    hasErrors = true;
    console.log("[ERROR] Missing backend/package.json");
  } else {
    console.log("[OK] backend/package.json");
  }

  if (!exists(frontendPkg)) {
    hasErrors = true;
    console.log("[ERROR] Missing frontend/package.json");
  } else {
    console.log("[OK] frontend/package.json");
  }

  const backendEnv = checkEnvFile(path.join(backendDir, ".env"), [
    "PORT",
    "MONGODB_URI",
  ]);

  if (!backendEnv.ok) {
    hasErrors = true;
    console.log(`[ERROR] backend/.env missing keys: ${backendEnv.missing.join(", ")}`);
  } else {
    console.log("[OK] backend/.env base keys");
  }

  const hasAuthSecret = backendEnv.lines.some((line) =>
    /^(AUTH_SECRET|JWT_SECRET)=/.test(line)
  );
  if (!hasAuthSecret) {
    console.log("[WARN] backend/.env should define AUTH_SECRET or JWT_SECRET.");
  } else {
    console.log("[OK] backend auth secret key present");
  }

  const frontendEnvPath = path.join(frontendDir, ".env");
  if (!exists(frontendEnvPath)) {
    console.log("[WARN] frontend/.env not found (optional in dev with Vite proxy).");
  } else {
    console.log("[OK] frontend/.env");
  }

  const backendProbe = await probe("http://localhost:5000/api/content");
  if (!backendProbe.ok) {
    console.log("[WARN] Backend not responding on http://localhost:5000");
  } else {
    console.log(`[OK] Backend responding (status ${backendProbe.status})`);
  }

  const frontendProbe = await probe("http://localhost:5173/admin");
  if (!frontendProbe.ok) {
    console.log("[WARN] Frontend not responding on http://localhost:5173");
  } else {
    console.log(`[OK] Frontend responding (status ${frontendProbe.status})`);
  }

  if (hasErrors) {
    console.log("\nDoctor finished with errors.");
    process.exitCode = 1;
    return;
  }

  console.log("\nDoctor finished.");
}

main().catch((err) => {
  console.error("[ERROR] doctor failed:", err.message);
  process.exitCode = 1;
});
