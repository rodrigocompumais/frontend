//simple express server to run frontend production build;
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const liveDir = path.join(__dirname, "build-live");
const fallbackDir = path.join(__dirname, "build");
const staticDir = fs.existsSync(liveDir) ? liveDir : fallbackDir;

app.use(express.static(staticDir));
app.get("/*", function (req, res) {
	res.sendFile(path.join(staticDir, "index.html"));
});
app.listen(3000);
