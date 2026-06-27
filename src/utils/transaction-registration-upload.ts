import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export type UploadRegistrationDocumentResult =
  | { ok: true; fileName: string; url: string }
  | { ok: false; error: string };

export async function uploadRegistrationDocument(
  file: File
): Promise<UploadRegistrationDocumentResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("for", "transaction-registration-doc");

  const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(
    `${URLS.BASE}${URLS.uploadSingleFile}`,
    form
  );

  const url = (res.data as { url?: string } | null)?.url;
  if (res.success && url) {
    return { ok: true, fileName: file.name, url };
  }

  return {
    ok: false,
    error: res.message || res.error || "Could not upload the document.",
  };
}
