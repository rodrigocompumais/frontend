/**
 * Restaura build-previous em build-live.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const liveDir = path.join(root, "build-live");
const previousDir = path.join(root, "build-previous");

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

const main = () => {
  if (!fs.existsSync(previousDir)) {
    log("Não há build-previous para reverter.");
    process.exit(1);
  }

  if (commandExists("rsync")) {
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
        `${previousDir}/`,
        `${liveDir}/`
      ],
      { cwd: root, stdio: "inherit" }
    );

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  } else {
    removeDir(liveDir);
    fs.cpSync(previousDir, liveDir, { recursive: true });
  }

  log("Rollback concluído — build-live restaurado.");
};

main();
