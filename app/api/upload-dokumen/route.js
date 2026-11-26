import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

async function getAuthenticatedUser(request) {
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!accessToken || !supabaseUrl || !supabaseKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
  if (!response.ok) return null;
  return response.json();
}

export async function POST(request) {
  const user = await getAuthenticatedUser(request);
  if (!user?.id) return jsonError("Silakan masuk untuk mengunggah dokumen.", 401);

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return jsonError("Konfigurasi Cloudflare R2 belum lengkap.", 503);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const registrationNumber = String(formData.get("registration_number") || "");
  const docType = String(formData.get("doc_type") || "");

  if (!file || typeof file.arrayBuffer !== "function") {
    return jsonError("File dokumen belum dipilih.", 400);
  }
  if (!allowedTypes.has(file.type)) {
    return jsonError("Format file harus PDF, JPG, PNG, atau WEBP.", 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    return jsonError("Ukuran file maksimal 5 MB.", 400);
  }
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(registrationNumber) || !/^[a-zA-Z0-9_-]{1,40}$/.test(docType)) {
    return jsonError("Data pendaftaran atau jenis dokumen tidak valid.", 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?select=registration_number&user_id=eq.${encodeURIComponent(user.id)}&registration_number=eq.${encodeURIComponent(registrationNumber)}&role=eq.applicant&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: request.headers.get("authorization")
      },
      cache: "no-store"
    }
  );
  if (!profileResponse.ok) {
    console.error("Supabase gagal memvalidasi pemilik dokumen.", await profileResponse.text());
    return jsonError("Tidak dapat memvalidasi akun pendaftar.", 502);
  }
  const profiles = await profileResponse.json();
  if (!profiles.length) return jsonError("Akun ini tidak memiliki akses ke pendaftaran tersebut.", 403);

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "dokumen";
  const objectKey = `${registrationNumber}/${docType}-${Date.now()}-${cleanFileName}`;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });

  try {
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type
    }));
  } catch (error) {
    console.error("Gagal mengunggah dokumen ke Cloudflare R2.", error);
    return jsonError("Gagal mengunggah dokumen ke Cloudflare R2.", 502);
  } finally {
    client.destroy();
  }

  return Response.json({
    ok: true,
    key: objectKey,
    doc_type: docType
  });
}
