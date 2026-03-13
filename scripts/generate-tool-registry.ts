import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TOOLS_ROOT = path.join(process.cwd(), "packages/tools");
const OUTPUT_FILE = path.join(TOOLS_ROOT, "registry.json");

async function generate() {
  const tools: any[] = [];

  // We look specifically for gh-tools or any subfolders in packages/tools
  // This supports your nested github/create_issue structure
  async function scan(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        
        // If we find a manifest, this is a tool
        try {
          const manifestPath = path.join(fullPath, "manifest.json");
          const manifestFile = Bun.file(manifestPath);
          
          if (await manifestFile.exists()) {
            const content = await manifestFile.json();
            tools.push({
              ...content,
              // Relative path for the runtime loader to use
              importPath: path.relative(TOOLS_ROOT, path.join(fullPath, content.entry || "index.ts"))
              // Even better: 
              // importPath: path.relative(TOOLS_ROOT, path.join(fullPath, content.entry || "index.ts")).replace(/\\/g, '/')


            });
            continue; // Found a tool, no need to go deeper into this specific folder
          }
        } catch (e) {
          // No manifest here, keep digging
        }
        
        await scan(fullPath);
      }
    }
  }

  await scan(TOOLS_ROOT);
  
  await writeFile(OUTPUT_FILE, JSON.stringify(tools, null, 2));
  console.log(`🚀 Registry generated: ${tools.length} tools found.`);
}

generate().catch(console.error);