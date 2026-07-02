/**
 * Deploy sem derrubar o site.
 *
 * Com BUILD_STAGING=1 o CRA compila em ./build-staging (via config-overrides.paths).
 * As pastas servidas (build e build-live) só são atualizadas no final via rsync.
 * Funciona mesmo com PM2 em "serve -s build".
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const stagingDir = path.join(root, "build-staging");
const liveDir = path.join(root, "build-live");
const legacyDir = path.join(root, "build");
const previousDir = path.join(root, "build-previous");

const publishTargets = [
  { name: "build-live", dir: liveDir },
  { name: "build", dir: legacyDir }
];

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

const assertIndexHtml = (dir, label) => {
  const indexPath = path.join(dir, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html não encontrado em ${label} (${dir})`);
  }
};

const runStagingBuild = () => {
  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";

  return spawnSync(npmCmd, ["run", "build:staging"], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      BUILD_STAGING: "1",
      GENERATE_SOURCEMAP: "false",
      NODE_OPTIONS: process.env.NODE_OPTIONS || "--openssl-legacy-provider"
    }
  });
};

const backupCurrentLive = () => {
  const source =
    publishTargets.find((target) => fs.existsSync(path.join(target.dir, "index.html")))
      ?.dir || null;

  if (!source) {
    return;
  }

  removeDir(previousDir);

  if (process.platform === "win32") {
    fs.cpSync(source, previousDir, { recursive: true });
    return;
  }

  const result = spawnSync("cp", ["-a", source, previousDir], {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error("Falha ao criar backup em build-previous");
  }
};

const rsyncPublish = (source, target) => {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const result = spawnSync(
    "rsync",
    [
      "-a",
      "--delete",
      "--delay-updates",
      "--partial-dir=.rsync-partial",
      `${source}/`,
      `${target}/`
    ],
    { cwd: root, stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error(`rsync falhou ao publicar em ${target}`);
  }
};

const copyPublish = (source, target) => {
  const tempDir = `${target}-next`;

  removeDir(tempDir);
  fs.cpSync(source, tempDir, { recursive: true });
  removeDir(target);
  fs.renameSync(tempDir, target);
};

const publishToTarget = (source, target) => {
  if (commandExists("rsync")) {
    rsyncPublish(source, target);
    return;
  }

  copyPublish(source, target);
};

const ensureInitialTargets = () => {
  const seed = publishTargets.find((target) =>
    fs.existsSync(path.join(target.dir, "index.html"))
  );

  if (!seed) {
    return;
  }

  publishTargets.forEach((target) => {
    if (!fs.existsSync(path.join(target.dir, "index.html"))) {
      log(`Inicializando ${target.name} a partir de ${seed.name}...`);
      fs.cpSync(seed.dir, target.dir, { recursive: true });
    }
  });
};

const publishStaging = () => {
  assertIndexHtml(stagingDir, "build-staging");

  log("Gerando backup da versão ao vivo em build-previous...");
  backupCurrentLive();

  publishTargets.forEach((target) => {
    log(`Publicando build-staging → ${target.name}...`);
    publishToTarget(stagingDir, target.dir);
    assertIndexHtml(target.dir, target.name);
  });

  removeDir(stagingDir);
};

const main = () => {
  ensureInitialTargets();

  const hasLiveSite = publishTargets.some((target) =>
    fs.existsSync(path.join(target.dir, "index.html"))
  );

  if (!hasLiveSite) {
    log("Nenhum build publicado ainda — a primeira publicação ocorrerá ao final.");
  } else {
    log("Compilando em ./build-staging (build e build-live não serão alterados agora)...");
  }

  const result = runStagingBuild();

  if (result.status !== 0) {
    log("Build falhou — site em produção não foi alterado.");
    removeDir(stagingDir);
    process.exit(result.status || 1);
  }

  log("Publicando nova versão...");
  publishStaging();

  log("Concluído. Site atualizado sem downtime.");
  log("PM2 pode continuar com: serve -s build -l 3001");
};

main();
