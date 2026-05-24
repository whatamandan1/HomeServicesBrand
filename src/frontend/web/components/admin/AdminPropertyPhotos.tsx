"use client";

import { useEffect, useState } from "react";
import { api, type PropertyMedia } from "@/lib/api";

function AdminPhotoThumbnail({
  token,
  photo,
  onOpen,
}: {
  token: string;
  photo: PropertyMedia;
  onOpen: (src: string, fileName: string) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void api
      .adminFetchPropertyPhoto(token, photo.id)
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
  }, [photo.id, token]);

  return (
    <button
      type="button"
      disabled={!src}
      onClick={() => src && onOpen(src, photo.fileName)}
      className="h-24 w-24 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 transition hover:ring-2 hover:ring-gardens-primary/40 disabled:cursor-default disabled:hover:ring-0"
      aria-label={`View ${photo.fileName}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={photo.fileName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
          …
        </div>
      )}
    </button>
  );
}

function PhotoLightbox({
  src,
  fileName,
  onClose,
}: {
  src: string;
  fileName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={fileName}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-sm font-medium text-white hover:underline"
        >
          Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={fileName}
          className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <p className="mt-2 text-center text-xs text-white/80">{fileName}</p>
      </div>
    </div>
  );
}

export function AdminPropertyPhotos({
  token,
  customerId,
  propertyId,
}: {
  token: string;
  customerId: string;
  propertyId: string;
}) {
  const [photos, setPhotos] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; fileName: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .adminCustomerPropertyPhotos(token, customerId, propertyId)
      .then(setPhotos)
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [customerId, propertyId, token]);

  if (loading) {
    return <p className="mt-2 text-xs text-stone-400">Loading photos…</p>;
  }

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {photos.map((photo) => (
          <AdminPhotoThumbnail
            key={photo.id}
            token={token}
            photo={photo}
            onOpen={(src, fileName) => setLightbox({ src, fileName })}
          />
        ))}
      </div>
      {lightbox && (
        <PhotoLightbox
          src={lightbox.src}
          fileName={lightbox.fileName}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
