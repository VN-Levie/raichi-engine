import fs from "fs";
import path from "path";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  // Foreground colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const IMPORT_EXPORT_REGEX = /((?:import|export)[^'"]+from\s+['"])(\.{1,2}\/[^'"]+)(?<!\.js)(?<!\.json)(['"])/g;
// Giải thích regex:
// 1. ((?:import|export)[^'"]+from\s+['"]):
//    - (?:import|export): Khớp "import" hoặc "export" (non-capturing group).
//    - [^'"]+: Khớp bất kỳ ký tự nào không phải là dấu nháy đơn hoặc kép, một hoặc nhiều lần (ví dụ: "{ foo, bar }").
//    - from\s+: Khớp "from" theo sau là một hoặc nhiều khoảng trắng.
//    - ['"]: Khớp dấu nháy đơn hoặc kép mở đầu.
//    - -> Đây là group 1 (prefix)
// 2. (\.{1,2}\/[^'"]+):
//    - \.{1,2}\/: Khớp "./" hoặc "../".
//    - [^'"]+: Khớp bất kỳ ký tự nào không phải là dấu nháy đơn hoặc kép, một hoặc nhiều lần (tên đường dẫn).
//    - -> Đây là group 2 (importPath)
// 3. (?<!\.js)(?<!\.json):
//    - (?<!\.js): Negative lookbehind, đảm bảo rằng đường dẫn không kết thúc bằng ".js".
//    - (?<!\.json): Negative lookbehind, đảm bảo rằng đường dẫn không kết thúc bằng ".json".
//    - Quan trọng: Điều này đảm bảo chúng ta chỉ thêm ".js" nếu nó chưa có hoặc chưa phải là ".json".
// 4. (['"]):
//    - Khớp dấu nháy đơn hoặc kép đóng lại.
//    - -> Đây là group 3 (suffix)
// Mục tiêu: Tìm các import/export tương đối không có phần mở rộng .js hoặc .json và thêm .js vào.

function fixFileImports(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    const newContent = originalContent.replace(
      IMPORT_EXPORT_REGEX,
      (match, prefix, importPath, suffix) => {
        modified = true;
        return `${prefix}${importPath}.js${suffix}`;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, newContent, "utf-8");
      console.log(`  ${colors.green}Updated:${colors.reset} ${colors.yellow}${path.relative(process.cwd(), filePath)}${colors.reset}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`${colors.red}Error processing file ${filePath}: ${error.message}${colors.reset}`);
    return false;
  }
}

function walkAndFix(dir, stats = { processed: 0, modified: 0 }) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkAndFix(fullPath, stats);
      } else if (entry.isFile() && fullPath.endsWith(".js")) {
        stats.processed++;
        if (fixFileImports(fullPath)) {
          stats.modified++;
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${dir}: ${error.message}${colors.reset}`);
  }
  return stats;
}

const targetDirArg = process.argv[2];
const targetDir = targetDirArg ? path.resolve(targetDirArg) : path.resolve("dist");

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`${colors.red}Error: Directory "${targetDir}" does not exist or is not a directory.${colors.reset}`);
  process.exit(1);
}

const startTime = Date.now();
const finalStats = walkAndFix(targetDir);
const duration = (Date.now() - startTime) / 1000;

if (finalStats.modified !== 0) {
  console.log(`\n${colors.cyan}Fixing import extensions summary for "${colors.yellow}${targetDir}${colors.cyan}"...${colors.reset}`);
  console.log(
    `${colors.bright}Scan complete in ${colors.green}${duration.toFixed(2)}s${colors.reset}${colors.bright}. Processed ${colors.green}${finalStats.processed}${colors.reset}${colors.bright} .js files, modified ${colors.green}${finalStats.modified}${colors.reset}${colors.bright} files.${colors.reset}`
  );
} else if (finalStats.processed > 0 && finalStats.modified === 0) {
  console.log(`${colors.green}Ready! All ${finalStats.processed} .js files checked, no changes needed.${colors.reset}`);
} else if (finalStats.processed === 0) {
    console.log(`${colors.yellow}No .js files found to process in "${targetDir}".${colors.reset}`);
} else {
    console.log(`${colors.green}Ready! No changes needed.${colors.reset}`);
}