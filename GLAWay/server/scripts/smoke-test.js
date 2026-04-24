import "../config/loadEnv.js";
import assert from "node:assert/strict";
import net from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, "..");

const SMOKE_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@glaway.com";
const SMOKE_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";

const findFreePort = async () =>
  new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.unref();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();

      probe.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(address.port);
      });
    });
  });

const fetchJson = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    return { response, body, text };
  } finally {
    clearTimeout(timeoutId);
  }
};

const waitForHealthyServer = async (baseUrl, child, timeoutMs = 180000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(
        `Smoke server exited early with code ${child.exitCode ?? "unknown"}`
      );
    }

    try {
      const { response, body } = await fetchJson(`${baseUrl}/api/health`, {}, 5000);

      if (response.ok && body?.data?.database?.ready) {
        return body;
      }
    } catch {
      // Keep waiting until the API is up.
    }

    await delay(1000);
  }

  throw new Error("Timed out waiting for the backend to become healthy");
};

const requestJson = async (baseUrl, pathName, options = {}, timeoutMs = 10000) => {
  const { response, body, text } = await fetchJson(
    `${baseUrl}${pathName}`,
    options,
    timeoutMs
  );

  if (!response.ok) {
    throw new Error(
      `Request failed: ${options.method || "GET"} ${pathName} -> ${response.status} ${text}`
    );
  }

  return body;
};

const requestJsonWithStatus = async (
  baseUrl,
  pathName,
  expectedStatus,
  options = {},
  timeoutMs = 10000
) => {
  const { response, body, text } = await fetchJson(
    `${baseUrl}${pathName}`,
    options,
    timeoutMs
  );

  assert.equal(
    response.status,
    expectedStatus,
    `Expected ${expectedStatus} for ${options.method || "GET"} ${pathName}, got ${response.status}: ${text}`
  );

  return body;
};

const stopChild = async (child) => {
  if (child.exitCode !== null) {
    return;
  }

  child.kill("SIGTERM");

  await Promise.race([
    once(child, "exit"),
    delay(10000).then(() => {
      throw new Error("Timed out waiting for smoke server shutdown");
    })
  ]);
};

const main = async () => {
  const port = await findFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const useExternalMongo = Boolean(process.env.SMOKE_MONGO_URI);
  const smokeMongoUri =
    process.env.SMOKE_MONGO_URI ||
    "mongodb://127.0.0.1:1/glaway-smoke?serverSelectionTimeoutMS=1000&connectTimeoutMS=1000";
  const allowMemoryDb =
    process.env.SMOKE_ALLOW_MEMORY_DB ?? (useExternalMongo ? "false" : "true");

  const child = spawn(process.execPath, ["server.js"], {
    cwd: serverDir,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      MONGO_URI: smokeMongoUri,
      ALLOW_MEMORY_DB: allowMemoryDb,
      MOCK_RAZORPAY: "true",
      RAZORPAY_KEY_ID: "rzp_test_smoke_key",
      RAZORPAY_KEY_SECRET: "smoke_secret"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  try {
    console.log(`Starting smoke server on ${baseUrl}...`);
    await waitForHealthyServer(baseUrl, child);
    console.log("Backend is healthy. Running endpoint checks...");

    const root = await requestJson(baseUrl, "/");
    assert.equal(root.success, true);
    assert.equal(root.data.baseUrl, "/api");

    const health = await requestJson(baseUrl, "/api/health");
    assert.equal(health.success, true);
    assert.equal(health.data.database.ready, true);

    const foodItems = await requestJson(baseUrl, "/api/food");
    assert.ok(Array.isArray(foodItems));
    assert.ok(foodItems.length > 0, "Expected at least one seeded food item");

    const animationSettings = await requestJson(baseUrl, "/api/animation-settings");
    assert.equal(animationSettings.success, true);
    assert.equal(animationSettings.data.animationEnabled, true);

    const uniqueSuffix = Date.now();
    const userEmail = `smoke-${uniqueSuffix}@example.com`;
    const signup = await requestJsonWithStatus(
      baseUrl,
      "/api/auth/signup",
      201,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Smoke Test User",
          email: userEmail,
          password: "password123"
        })
      }
    );

    const userToken = signup.data?.token || signup.token;
    assert.ok(userToken, "Expected a user token from signup");

    const me = await requestJson(baseUrl, "/api/auth/me", {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    assert.equal(me.data.email, userEmail);

    const paymentOrder = await requestJson(baseUrl, "/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ amount: 173 })
    });
    assert.equal(paymentOrder.data.isMock, true);

    const verification = await requestJson(baseUrl, "/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        razorpay_order_id: paymentOrder.data.id,
        razorpay_payment_id: `mock_payment_${uniqueSuffix}`
      })
    });
    assert.equal(verification.data.verified, true);
    assert.equal(verification.data.paymentStatus, "Paid");

    const firstFoodItem = foodItems[0];
    const placedOrder = await requestJsonWithStatus(
      baseUrl,
      "/api/order",
      201,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          items: [
            {
              foodItem: firstFoodItem._id,
              quantity: 1
            }
          ],
          paymentMethod: "COD",
          paymentStatus: "Pending"
        })
      }
    );

    const orderId = placedOrder.data?._id || placedOrder._id;
    assert.ok(orderId, "Expected a created order id");

    const adminLogin = await requestJson(baseUrl, "/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: SMOKE_ADMIN_EMAIL,
        password: SMOKE_ADMIN_PASSWORD
      })
    });

    const adminToken = adminLogin.data?.token || adminLogin.token;
    assert.ok(adminToken, "Expected an admin token from login");

    const adminProfile = await requestJson(baseUrl, "/api/admin/me", {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert.equal(adminProfile.data.email, SMOKE_ADMIN_EMAIL);

    const updatedOrder = await requestJson(baseUrl, `/api/order/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "Preparing" })
    });
    assert.equal(updatedOrder.data.status, "Preparing");

    const myOrders = await requestJson(baseUrl, "/api/order/my-orders", {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    assert.ok(Array.isArray(myOrders));
    assert.ok(
      myOrders.some((order) => order._id === orderId),
      "Expected the new order to appear in the user's order history"
    );

    const adminOrders = await requestJson(baseUrl, "/api/admin/orders", {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert.ok(Array.isArray(adminOrders));
    assert.ok(
      adminOrders.some((order) => order._id === orderId),
      "Expected the new order to appear in the admin order list"
    );

    console.log("Smoke test passed.");
  } finally {
    await stopChild(child);
  }
};

main().catch((error) => {
  console.error("Smoke test failed.");
  console.error(error);
  process.exit(1);
});
