"use client";

import { useEffect, useState } from "react";
import { api, type PropertyMedia } from "@/lib/api";

function AdminPhotoThumbnail({
  token,
  photo,
}: {
  token: string;
  photo: PropertyMedia;
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
    <div className="h-20 w-20 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={photo.fileName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
          …
        </div>
      )}
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
    <div className="mt-2 flex flex-wrap gap-2">
      {photos.map((photo) => (
        <AdminPhotoThumbnail key={photo.id} token={token} photo={photo} />
      ))}
    </div>
  );
}
