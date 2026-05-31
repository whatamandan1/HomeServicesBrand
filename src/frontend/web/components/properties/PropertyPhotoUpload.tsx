"use client";

import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { compressImageFile } from "@/lib/compress-image";
import type { PropertyMedia } from "@/lib/api";

type PropertyPhotoUploadProps = {
  token: string;
  propertyId: string;
  maxPhotos?: number;
  onPhotosChange?: (count: number) => void;
  loadPhotos: (token: string, propertyId: string) => Promise<PropertyMedia[]>;
  uploadPhoto: (token: string, propertyId: string, file: File) => Promise<PropertyMedia>;
  deletePhoto: (token: string, photoId: string) => Promise<void>;
  fetchPhotoBlob: (token: string, photoId: string) => Promise<Blob>;
};

function AuthenticatedPhoto({
  token,
  photo,
  fetchPhotoBlob,
  onDelete,
}: {
  token: string;
  photo: PropertyMedia;
  fetchPhotoBlob: (token: string, photoId: string) => Promise<Blob>;
  onDelete: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void fetchPhotoBlob(token, photo.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (active) setSrc(null);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fetchPhotoBlob, photo.id, token]);

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={photo.fileName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">Loading…</div>
      )}
      <button
        type="button"
        aria-label="Remove photo"
        onClick={onDelete}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PropertyPhotoUpload({
  token,
  propertyId,
  maxPhotos = 3,
  onPhotosChange,
  loadPhotos,
  uploadPhoto,
  deletePhoto,
  fetchPhotoBlob,
}: PropertyPhotoUploadProps) {
  const [photos, setPhotos] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadPhotos(token, propertyId);
      setPhotos(list);
      onPhotosChange?.(list.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load photos");
    } finally {
      setLoading(false);
    }
  }, [loadPhotos, onPhotosChange, propertyId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (photos.length >= maxPhotos) {
      setError(`You can upload up to ${maxPhotos} photos.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      const uploaded = await uploadPhoto(token, propertyId, compressed);
      setPhotos((current) => {
        const next = [...current, uploaded];
        onPhotosChange?.(next.length);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    setError(null);
    try {
      await deletePhoto(token, photoId);
      setPhotos((current) => {
        const next = current.filter((p) => p.id !== photoId);
        onPhotosChange?.(next.length);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-stone-700">Garden photos</p>
        <p className="text-xs text-stone-500">
          Optional - up to {maxPhotos} photos help your gardener prepare for the first visit.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Loading photos…</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <AuthenticatedPhoto
              key={photo.id}
              token={token}
              photo={photo}
              fetchPhotoBlob={fetchPhotoBlob}
              onDelete={() => void handleDelete(photo.id)}
            />
          ))}

          {photos.length < maxPhotos && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-500 hover:border-gardens-primary hover:text-gardens-primary">
              <ImagePlus className="h-5 w-5" />
              <span className="mt-1 text-[10px] font-medium">{uploading ? "Uploading…" : "Add photo"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => void handleFileChange(e)}
              />
            </label>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
