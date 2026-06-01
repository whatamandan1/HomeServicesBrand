"use client";

import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { compressImageFile } from "@/lib/compress-image";
import type { ProviderIdPhoto } from "@/lib/api";

type Props = {
  token: string;
  disabled?: boolean;
  onPhotoChange?: (hasPhoto: boolean) => void;
  loadPhoto: (token: string) => Promise<ProviderIdPhoto | null>;
  uploadPhoto: (token: string, file: File) => Promise<ProviderIdPhoto>;
  deletePhoto: (token: string) => Promise<void>;
  fetchPhotoBlob: (token: string) => Promise<Blob>;
};

export function ProviderIdPhotoUpload({
  token,
  disabled = false,
  onPhotoChange,
  loadPhoto,
  uploadPhoto,
  deletePhoto,
  fetchPhotoBlob,
}: Props) {
  const [photo, setPhoto] = useState<ProviderIdPhoto | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadPhoto(token);
      setPhoto(loaded);
      onPhotoChange?.(loaded !== null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load ID photo");
    } finally {
      setLoading(false);
    }
  }, [loadPhoto, onPhotoChange, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!photo) {
      setPreviewSrc(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    void fetchPhotoBlob(token)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewSrc(objectUrl);
      })
      .catch(() => {
        if (active) setPreviewSrc(null);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fetchPhotoBlob, photo, token]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled) return;

    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      const uploaded = await uploadPhoto(token, compressed);
      setPhoto(uploaded);
      onPhotoChange?.(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (disabled) return;
    setError(null);
    try {
      await deletePhoto(token);
      setPhoto(null);
      onPhotoChange?.(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-stone-700">Photo ID upload</p>
        <p className="text-xs text-stone-500">
          Upload a clear photo of your passport, driving licence, or other valid photo ID. Required before we can
          verify and approve you.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {photo && (
            <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
              {previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewSrc} alt={photo.fileName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
                  Loading…
                </div>
              )}
              {!disabled && (
                <button
                  type="button"
                  aria-label="Remove ID photo"
                  onClick={() => void handleDelete()}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {!photo && !disabled && (
            <label className="flex h-28 w-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-500 hover:border-gardens-primary hover:text-gardens-primary">
              <ImagePlus className="h-5 w-5" />
              <span className="mt-1 px-2 text-center text-[10px] font-medium">
                {uploading ? "Uploading…" : "Upload photo ID"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => void handleFileChange(e)}
              />
            </label>
          )}

          {photo && !disabled && (
            <label className="flex h-28 w-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-500 hover:border-gardens-primary hover:text-gardens-primary">
              <ImagePlus className="h-5 w-5" />
              <span className="mt-1 px-2 text-center text-[10px] font-medium">
                {uploading ? "Uploading…" : "Replace photo"}
              </span>
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
