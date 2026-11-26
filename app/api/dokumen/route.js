import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

export async function GET(request) {
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken || !supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Silakan masuk untuk melihat dokumen." }, { status: 401 });
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
  if (!userResponse.ok) {
    return Response.json({ error: "Sesi masuk tidak valid." }, { status: 401 });
  }
  const user = await userResponse.json();

  const key = new URL(request.url).searchParams.get("key") || "";
  const registrationNumber = key.split("/")[0];
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(registrationNumber) || !key.startsWith(`${registrationNumber}/`)) {
    return Response.json({ error: "Kunci dokumen tidak valid." }, { status: 400 });
  }

  const query = new URLSearchParams({
    select: "registration_number,documents",
    registration_number: `eq.${registrationNumber}`,
    role: "eq.applicant",
    limit: "1"
  });
  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?${query}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
  if (!profileResponse.ok) {
    console.error("Supabase gagal memvalidasi akses dokumen.", await profileResponse.text());
    return Response.json({ error: "Tidak dapat memvalidasi akses dokumen." }, { status: 502 });
  }
  const profiles = await profileResponse.json();
  const profile = profiles[0];
  if (!profile || !Object.values(profile.documents || {}).includes(key)) {
    return Response.json({ error: "Anda tidak memiliki akses ke dokumen ini." }, { status: 403 });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return Response.json({ error: "Konfigurasi Cloudflare R2 belum lengkap." }, { status: 503 });
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });
  try {
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucketName, Key: key }),
      { expiresIn: 60 }
    );
    return Response.json({ url });
  } catch (error) {
    console.error("Gagal membuat tautan aman Cloudflare R2.", error);
    return Response.json({ error: "Tidak dapat membuka dokumen." }, { status: 502 });
  } finally {
    client.destroy();
  }
}
