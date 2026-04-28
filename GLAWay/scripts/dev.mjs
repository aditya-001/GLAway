import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");
const clientDir = path.join(rootDir, "client");

const serverHost = process.env.SERVER_HOST || "127.0.0.1";
const serverPort = String(process.env.PORT || 5000);
const apiUrl = process.env.VITE_API_URL || `http://${serverHost}:${serverPort}/api`;

const children = new Set();
let shuttingDown = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const allChildrenExited = () =>
  Array.from(children).every((child) => child.exitCode !== null);

const spawnProcess = (command, args, cwd, envOverrides = {}) => {
  const child = spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      ...envOverrides
    },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  children.add(child);

  child.on("exit", (code, signal) => {
    children.delete(child);

    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    for (const otherChild of children) {
      otherChild.kill("SIGTERM");
    }

    const exitCode = code ?? (signal ? 1 : 0);
    process.exit(exitCode);
  });

  return child;
};

const waitForBackend = async () => {
  const healthUrl = `http://${serverHost}:${serverPort}/api/health`;
  const timeoutAt = Date.now() + 120_000;

  while (Date.now() < timeoutAt) {
    if (Array.from(children).some((child) => child.exitCode !== null)) {
      throw new Error("Backend exited before it became ready");
    }

    try {
      const response = await fetch(healthUrl, { cache: "no-store" });

      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the API is ready.
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for backend at ${healthUrl}`);
};

const shutdown = async (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`\nReceived ${signal}. Shutting down dev servers...`);

  if (signal === "SIGTERM") {
    for (const child of children) {
      if (child.exitCode === null) {
        child.kill("SIGTERM");
      }
    }
  }

  const timeoutAt = Date.now() + 5000;

  while (Date.now() < timeoutAt && !allChildrenExited()) {
    await sleep(100);
  }

  if (!allChildrenExited()) {
    for (const child of children) {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }
  }

  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

const main = async () => {
  console.log("Starting backend...");
  spawnProcess("npm", ["run", "start"], serverDir);

  console.log(`Waiting for backend on ${apiUrl}...`);
  await waitForBackend();
  console.log("Backend is ready. Starting frontend...");

  const clientEnv = {
    ...process.env,
    VITE_API_URL: apiUrl
  };
  delete clientEnv.PORT;

  spawnProcess("npm", ["run", "dev"], clientDir, clientEnv);

  console.log("GLAWay is running.");
};

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  await shutdown("SIGTERM");
  process.exit(1);
}
