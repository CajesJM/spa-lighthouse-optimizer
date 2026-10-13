import { spawn } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const name = "spa-lighthouse-optimizer";
const source = fileURLToPath(new URL("..", import.meta.url));
const usage = `Usage: spa-lighthouse-optimizer install [--target <skills-directory>]

Install the skill into Codex's personal skills directory by default. Pass --target
to install into another agent's skills directory. The destination must be absent.`;

function parseArgs(args) {
  if (args.length === 0 || args.includes("--help") || args.includes("-h"))
    return { help: true };
  if (args[0] !== "install") throw new Error(`Unknown command: ${args[0]}`);
  let target;
  for (let index = 1; index < args.length; index += 1) {
    if (args[index] !== "--target")
      throw new Error(`Unknown option: ${args[index]}`);
    if (target !== undefined) throw new Error("Duplicate --target option");
    target = args[++index];
    if (!target || target.startsWith("--"))
      throw new Error("Missing value for --target");
  }
  const codexHome = process.env.CODEX_HOME?.trim()
    ? path.resolve(process.env.CODEX_HOME)
    : path.join(homedir(), ".codex");
  return {
    skillsDirectory: target
      ? path.resolve(target)
      : path.join(codexHome, "skills"),
  };
}

async function exists(location) {
  try {
    await lstat(location);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function installDependencies(directory) {
  const npmArgs = [
    "ci",
    "--omit=dev",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
  ];
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `npm ${npmArgs.join(" ")}`]
      : npmArgs;
  const child = spawn(command, args, {
    cwd: directory,
    stdio: "inherit",
  });
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (code !== 0)
    throw new Error(`Dependency installation failed with exit code ${code}`);
}

async function install(skillsDirectory) {
  const destination = path.join(skillsDirectory, name);
  if (await exists(destination))
    throw new Error(
      `Already installed at ${destination}. Move or remove that installation before retrying.`,
    );
  await mkdir(skillsDirectory, { recursive: true });
  const stage = await mkdtemp(path.join(skillsDirectory, `.${name}-install-`));
  try {
    for (const item of [
      "SKILL.md",
      "agents",
      "references",
      "scripts",
      "package.json",
      "npm-shrinkwrap.json",
    ]) {
      await cp(path.join(source, item), path.join(stage, item), {
        recursive: true,
      });
    }
    await installDependencies(stage);
    await rename(stage, destination);
  } catch (error) {
    if (
      path.dirname(stage) === skillsDirectory &&
      path.basename(stage).startsWith(`.${name}-install-`)
    ) {
      await rm(stage, { recursive: true, force: true });
    }
    throw error;
  }
  process.stdout.write(
    `Installed ${name} at ${destination}\nStart a new agent session, then invoke $${name} in a website project.\n`,
  );
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) process.stdout.write(`${usage}\n`);
  else await install(options.skillsDirectory);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
