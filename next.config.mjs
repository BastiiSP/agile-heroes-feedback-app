import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eindeutige Projektwurzel für File-Tracing (es existiert eine weitere
  // package-lock.json oberhalb des Projekts).
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
