// services/uploadItem.ts
export type PresignResp = {
  success: boolean;
  data: { uploadUrl: string; key: string; imageUrl?: string };
  error?: string;
};

export type CreateItemPayload = {
  image: string;
  name: string;
  description: string;
  price: number;
  category: string; // categoryId
  tag?: string;
};

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `${res.status} ${res.statusText} - ${
        text?.slice(0, 200) || "empty response"
      }`
    );
  }
}

export async function presignUpload(
  file: File,
  token: string | null
): Promise<PresignResp["data"]> {
  const r = await fetch(`/api/v1/upload/r2/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ contentType: file.type, fileName: file.name }),
  });
  if (!r.ok) throw new Error(`presign failed: ${r.status} ${r.statusText}`);
  const j = (await parseJsonSafe(r)) as PresignResp;
  if (!j?.success) throw new Error(j?.error || "ขอ presign ไม่สำเร็จ");
  return j.data;
}

export async function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  signal?: AbortSignal,
  onProgress?: (loaded: number, total: number) => void
) {
  // fetch ไม่มี progress event; ถ้าอยากมีจริง ให้ใช้ XHR
  // ที่นี่ให้รองรับแค่ abort ได้
  const r = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
    signal,
  });
  if (!r.ok) throw new Error(await r.text());
}

export async function createItem(
  payload: CreateItemPayload,
  token: string | null
) {
  const r = await fetch(`/api/v1/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`create item failed: ${r.status} ${r.statusText}`);
  const j = await parseJsonSafe(r);
  if (!j?.success) throw new Error(j?.error || "สร้างไอเท็มไม่สำเร็จ");
  return j;
}
