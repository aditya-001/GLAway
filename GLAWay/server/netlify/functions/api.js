import serverless from "serverless-http";
import app, { appReady } from "../../server.js";

const expressHandler = serverless(app);

export const handler = async (event, context) => {
  await appReady;

  event.path = event.path.replace(/^\/\.netlify\/functions\/api/, "");

  if (event.path === "") {
    event.path = "/";
  }

  return expressHandler(event, context);
};
