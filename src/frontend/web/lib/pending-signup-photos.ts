import { compressImageFile } from "@/lib/compress-image";

const KEY = "pendingPropertyPhotos";

type StashedPhoto = {
  name: string;
  type: string;
  data: string;
};

export async function stashSignupPhotos(files: File[]) {
  if (typeof window === "undefined" || files.length === 0) return;

  const items: StashedPhoto[] = [];
  for (const file of files.slice(0, 3)) {
    const compressed = await compressImageFile(file);
    const buffer = await compressed.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    items.push({
      name: compressed.name,
      type: compressed.type,
      data: btoa(binary),
    });
  }

  sessionStorage.setItem(KEY, JSON.stringify(items));
}

export function takeSignupPhotos(): StashedPhoto[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return [];
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as StashedPhoto[];
  } catch {
    return [];
  }
}

export function stashedPhotoToFile(item: StashedPhoto): File {
  const binary = atob(item.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], item.name, { type: item.type });
}
