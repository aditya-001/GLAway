import serverless from "serverless-http";
import app from "../../server.js";

const expressHandler = serverless(app);

export const handler = async (event, context) => {
  event.path = event.path.replace(/^\/\.netlify\/functions\/api/, "");

  if (event.path === "") {
    event.path = "/";
  }

  return expressHandler(event, context);
};
