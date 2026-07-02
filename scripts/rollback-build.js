/**
 * Reverte para o build anterior (build-previous), se existir.
 * Útil se a nova versão tiver problema após deploy.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const buildDir = path.join(root, "build");
const previousDir = path.join(root, "build-previous");
const brokenDir = path.join(root, "build-broken");

const log = (msg) => console.log(`[build:rollback] ${msg}`);

const removeDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const main = () => {
  if (!fs.existsSync(previousDir)) {
    log("Não há build-previous para reverter.");
    process.exit(1);
  }

  removeDir(brokenDir);

  if (fs.existsSync(buildDir)) {
    fs.renameSync(buildDir, brokenDir);
  }

  fs.renameSync(previousDir, buildDir);
  removeDir(brokenDir);

  log("Rollback concluído — build anterior restaurado em /build.");
};

main();
