import fs from "fs"
import path from "path"

function fixFileImports(filePath) {
  let content = fs.readFileSync(filePath, "utf-8")

  content = content.replace(
    /((?:import|export)[^'"]+from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g,
    (match, prefix, importPath, suffix) => {
      if (importPath.endsWith(".js") || importPath.endsWith(".json")) return match
      return `${prefix}${importPath}.js${suffix}`
    }
  )

  fs.writeFileSync(filePath, content, "utf-8")
}

function walkAndFix(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      walkAndFix(fullPath)
    } else if (fullPath.endsWith(".js")) {
      fixFileImports(fullPath)
    }
  }
}

walkAndFix("dist")
