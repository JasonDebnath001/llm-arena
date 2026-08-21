import arcjet, { shield } from "@arcjet/next";

const key = process.env.ARCJET_KEY;

if (!key) {
  throw new Error("ARCJET_KEY is not configured");
}

const aj = arcjet({
  key,
  rules: [shield({ mode: "LIVE" })],
});

export default aj;
