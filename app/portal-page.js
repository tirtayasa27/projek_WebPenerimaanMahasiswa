import { readFile } from "node:fs/promises";
import path from "node:path";
import PortalClient from "./portal-client";

export default async function PortalPage() {
  const htmlPath = path.join(process.cwd(), "public", "index.html");
  const source = await readFile(htmlPath, "utf8");
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];

  if (!body) {
    throw new Error("Konten portal pada public/index.html tidak memiliki elemen body.");
  }

  const markup = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  return (
    <PortalClient
      markup={markup}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ""}
      supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}
    />
  );
}
