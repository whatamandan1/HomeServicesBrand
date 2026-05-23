const KEY = "pendingPropertyPhotos";

type StashedPhoto = {
  name: string;
  type: string;
  dataUrl: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not prepare photo."));
    };
    reader.onerror = () => reject(new Error("Could not prepare photo."));
    reader.readAsDataURL(file);
  });
}

/** Store already-compressed photos for upload after Stripe checkout. */
export async function stashSignupPhotos(files: File[]) {
  if (typeof window === "undefined" || files.length === 0) return;

  const items = await Promise.all(
    files.slice(0, 3).map(async (file) => ({
      name: file.name,
      type: file.type,
      dataUrl: await readFileAsDataUrl(file),
    }))
  );

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

export async function stashedPhotoToFile(item: StashedPhoto): Promise<File> {
  const response = await fetch(item.dataUrl);
  const blob = await response.blob();
  return new File([blob], item.name, { type: item.type });
}
