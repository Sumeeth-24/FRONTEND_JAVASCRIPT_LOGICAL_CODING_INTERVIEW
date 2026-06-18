const fs = require("fs");
const f = "D:/Projects/frontend-q/FRONTEND_JAVASCRIPT_LOGICAL_CODING_INTERVIEW/frontend-interview-theory.js";
const lines = fs.readFileSync(f, "utf8").split("\n");
fs.writeFileSync(f, lines.slice(0, 2551).join("\n"), "utf8");
console.log("Truncated to 2551 lines");
