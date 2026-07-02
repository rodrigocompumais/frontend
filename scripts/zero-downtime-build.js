/**
 * Deploy sem derrubar o site.
 *
 * react-scripts 3.x ignora BUILD_PATH e sempre compila em ./build
 * (apagando essa pasta no início). Por isso o serve deve apontar para
 * ./build-live — pasta separada atualizada só ao final via rsync atômico.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const stagingDir = path.join(root, "build");
const liveDir = path.join(root, "build-live");
const previousDir = path.join(root, "build-previous");

const log = (msg) => console.log(`[build:live] ${msg}`);

const removeDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const commandExists = (cmd) => {
  const checker = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(checker, [cmd], { stdio: "ignore" });
  return result.status === 0;
};

const assertIndexHtml = (dir) => {
  const indexPath = path.join(dir, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html não encontrado em ${dir}`);
  }
};

const runBuild = () => {
  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";

  return spawnSync(npmCmd, ["run", "build:internal"], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      GENERATE_SOURCEMAP: "false",
      NODE_OPTIONS: process.env.NODE_OPTIONS || "--openssl-legacy-provider"
    }
  });
};

const backupLiveBuild = () => {
  if (!fs.existsSync(liveDir)) {
    return;
  }

  removeDir(previousDir);

  if (process.platform === "win32") {
    fs.cpSync(liveDir, previousDir, { recursive: true });
    return;
  }

  const result = spawnSync("cp", ["-a", liveDir, previousDir], {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error("Falha ao criar backup em build-previous");
  }
};

const publishWithRsync = () => {
  if (!fs.existsSync(liveDir)) {
    fs.mkdirSync(liveDir, { recursive: true });
  }

  const result = spawnSync(
    "rsync",
    [
      "-a",
      "--delete",
      "--delay-updates",
      "--partial-dir=.rsync-partial",
      `${stagingDir}/`,
      `${liveDir}/`
    ],
    { cwd: root, stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error("rsync falhou ao publicar em build-live");
  }
};

const publishWithCopy = () => {
  const tempDir = path.join(root, "build-live-next");

  removeDir(tempDir);
  fs.cpSync(stagingDir, tempDir, { recursive: true });

  removeDir(liveDir);
  fs.renameSync(tempDir, liveDir);
};

const publishStagingToLive = () => {
  assertIndexHtml(stagingDir);

  log("Gerando backup da versão ao vivo em build-previous...");
  backupLiveBuild();

  if (commandExists("rsync")) {
    log("Publicando build → build-live com rsync (sem downtime)...");
    publishWithRsync();
  } else {
    log("rsync não encontrado — publicando com cópia local...");
    publishWithCopy();
  }

  assertIndexHtml(liveDir);
};

const main = () => {
  if (!fs.existsSync(liveDir) && fs.existsSync(stagingDir)) {
    log("Primeira publicação: copiando build existente para build-live...");
    fs.cpSync(stagingDir, liveDir, { recursive: true });
  }

  log("Compilando em ./build (build-live continua servindo o site)...");
  const result = runBuild();

  if (result.status !== 0) {
    log("Build falhou — build-live não foi alterado.");
    process.exit(result.status || 1);
  }

  log("Publicando nova versão em build-live...");
  publishStagingToLive();

  log("Concluído. O serve deve apontar para build-live (não build).");
  log("Ex.: serve -s build-live -l 3001");
};

main();
