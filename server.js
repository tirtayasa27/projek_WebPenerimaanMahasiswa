require("dotenv").config();
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const root = path.join(__dirname, "public");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf"
};
const port = Number(process.env.PORT) || 3000;
const spaRoutes = new Set(["/admin", "/login"]);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const r2AccountId = process.env.R2_ACCOUNT_ID || "";
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const r2BucketName = process.env.R2_BUCKET_NAME || "";
const r2PublicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

const r2Configured = Boolean(
  r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2BucketName
);

const r2Client = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey
      }
    })
  : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Maksimal 5 MB per file
});

// Helper agar multer bisa berjalan di dalam node:http
function runMulterSingle(request, response, fieldName) {
  return new Promise((resolve, reject) => {
    upload.single(fieldName)(request, response, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

http.createServer(async (request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === "/api/health") {
    return sendJson(response, 200, {
      ok: true,
      supabaseConfigured: Boolean(supabaseUrl && supabaseKey),
      r2Configured
    });
  }

  if (pathname === "/api/upload-dokumen") {
    if (request.method !== "POST") {
      return sendJson(response, 405, { error: "Method tidak diizinkan. Gunakan POST." });
    }

    if (!r2Configured || !r2Client) {
      return sendJson(response, 503, {
        error: "Konfigurasi Cloudflare R2 di file .env belum lengkap."
      });
    }

    try {
      await runMulterSingle(request, response, "file");

      if (!request.file) {
        return sendJson(response, 400, { error: "File dokumen belum dipilih." });
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(request.file.mimetype)) {
        return sendJson(response, 400, {
          error: "Format file harus PDF, JPG, PNG, atau WEBP."
        });
      }

      const body = request.body || {};
      const cleanReg = String(body.registration_number || "pendaftar").replace(/[^a-zA-Z0-9_-]/g, "");
      const cleanDocType = String(body.doc_type || "dokumen").replace(/[^a-zA-Z0-9_-]/g, "");
      const cleanFileName = request.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectKey = `${cleanReg}/${cleanDocType}-${Date.now()}-${cleanFileName}`;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: r2BucketName,
          Key: objectKey,
          Body: request.file.buffer,
          ContentType: request.file.mimetype
        })
      );

      const fileUrl = r2PublicUrl ? `${r2PublicUrl}/${objectKey}` : objectKey;

      return sendJson(response, 200, {
        ok: true,
        key: objectKey,
        url: fileUrl,
        doc_type: cleanDocType
      });
    } catch (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return sendJson(response, 400, { error: "Ukuran file maksimal 5 MB." });
      }
      console.error("Gagal upload ke Cloudflare R2:", error);
      return sendJson(response, 500, {
        error: "Gagal mengunggah dokumen ke Cloudflare R2.",
        detail: error.message
      });
    }
  }

  if (pathname === "/api/profiles") {
    if (!supabaseUrl || !supabaseKey) {
      return sendJson(response, 503, {
        message: "SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di environment server."
      });
    }

    try {
      if (request.method === "GET") {
        const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&order=created_at.asc`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        });
        const data = await res.json();
        return sendJson(response, res.status, data);
      }

      if (request.method === "POST") {
        let rawBody = "";
        for await (const chunk of request) rawBody += chunk;
        const body = JSON.parse(rawBody || "{}");

        const res = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=registration_number`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation"
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        return sendJson(response, res.status, data);
      }
    } catch (error) {
      return sendJson(response, 500, { message: "Gagal berkomunikasi dengan Supabase", error: error.message });
    }
  }

  const requestedFile = pathname === "/" || spaRoutes.has(pathname)
    ? "index.html"
    : decodeURIComponent(pathname.slice(1));
  const filePath = path.resolve(root, requestedFile);

  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, "index.html")) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Internal server error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(contents);
  });
}).listen(port, () => {
  console.log(`Portal PMB berjalan di http://localhost:${port}`);
});