/**
 * Restaura build-previous em build e build-live.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const previousDir = path.join(root, "build-previous");
const targets = [
  path.join(root, "build-live"),
  path.join(root, "build")
];

const log = (msg) => console.log(`[build:rollback] ${msg}`);

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

const publishToTarget = (source, target) => {
  if (commandExists("rsync")) {
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
      process.exit(result.status || 1);
    }
    return;
  }

  removeDir(target);
  fs.cpSync(source, target, { recursive: true });
};

const main = () => {
  if (!fs.existsSync(previousDir)) {
    log("Não há build-previous para reverter.");
    process.exit(1);
  }

  targets.forEach((target) => {
    publishToTarget(previousDir, target);
  });

  log("Rollback concluído — build e build-live restaurados.");
};

main();
