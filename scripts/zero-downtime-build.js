/**
 * Build de produção sem derrubar o site:
 * 1. Compila em build-next (BUILD_PATH)
 * 2. Troca atômica: build → build-previous, build-next → build
 * 3. Remove build-previous após sucesso
 *
 * O servidor (serve/nginx/express) continua servindo a pasta build antiga
 * até a troca de nome — sem arquivos apagados no meio do build.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const buildDir = path.join(root, "build");
const nextDir = path.join(root, "build-next");
const previousDir = path.join(root, "build-previous");

const log = (msg) => console.log(`[build:live] ${msg}`);

const removeDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const runBuild = () => {
  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";

  return spawnSync(
    npmCmd,
    ["run", "build:internal"],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        BUILD_PATH: "build-next",
        GENERATE_SOURCEMAP: "false",
        NODE_OPTIONS: process.env.NODE_OPTIONS || "--openssl-legacy-provider"
      }
    }
  );
};

const swapBuildFolders = () => {
  if (!fs.existsSync(nextDir)) {
    throw new Error(`Pasta de staging não encontrada: ${nextDir}`);
  }

  removeDir(previousDir);

  if (fs.existsSync(buildDir)) {
    fs.renameSync(buildDir, previousDir);
  }

  fs.renameSync(nextDir, buildDir);
  log("Backup da versão anterior em build-previous (use npm run build:rollback se precisar).");
};

const main = () => {
  log("Limpando staging anterior...");
  removeDir(nextDir);

  log("Compilando em build-next (site atual continua em /build)...");
  const result = runBuild();

  if (result.status !== 0) {
    log("Build falhou — pasta build em produção não foi alterada.");
    removeDir(nextDir);
    process.exit(result.status || 1);
  }

  log("Trocando build-next → build...");
  swapBuildFolders();

  log("Concluído. Nova versão publicada sem downtime.");
};

main();
