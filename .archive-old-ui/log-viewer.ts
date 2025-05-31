import { watch } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const dir = "./logs";
console.log("Live log viewer (Ctrl-C quits)\n");

// Initial tail of the latest log file
try {
  execSync(`tail -n 20 ${join(dir, "*.log")}`, { stdio: "inherit" });
} catch (error) {
  console.log("No logs yet...");
}

watch(dir, { recursive: true }, (event, filename) => {
  if (event === "change" && filename?.endsWith(".log")) {
    try {
      execSync(`tail -n 5 ${join(dir, filename)}`, { stdio: "inherit" });
    } catch (error) {
      console.error("Error tailing log:", error);
    }
  }
});
