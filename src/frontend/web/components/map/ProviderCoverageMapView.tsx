"use client";

import type { AdminProvider } from "@/lib/api";
import { DEFAULT_MAP_CENTER, milesToMeters } from "@/lib/map-utils";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { FitBounds } from "@/components/map/FitBounds";
import { MapInvalidateSize } from "@/components/map/MapInvalidateSize";
import { MAP_ATTRIBUTION, MAP_STYLE, MAP_TILE_URL } from "@/components/map/map-tiles";

const PALETTE = ["#059669", "#0284c7", "#7c3aed", "#db2777", "#ca8a04"];

export function ProviderCoverageMapView({ providers }: { providers: AdminProvider[] }) {
  const positions: [number, number][] = providers.map((p) => [
    p.coverageLatitude!,
    p.coverageLongitude!,
  ]);

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 shadow-sm">
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={11}
        className="map-shell"
        style={MAP_STYLE}
        scrollWheelZoom={false}
      >
        <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
        <MapInvalidateSize />
        <FitBounds positions={positions} boundsKey={positions.join("|")} />
        {providers.flatMap((provider, index) => {
          const lat = provider.coverageLatitude!;
          const lon = provider.coverageLongitude!;
          const color = PALETTE[index % PALETTE.length];
          const label = `${provider.coveragePostcode ?? "—"}, ${provider.coverageRadiusMiles} miles${provider.isApproved ? "" : " · pending approval"}`;

          return [
            <Circle
              key={`${provider.id}-coverage`}
              center={[lat, lon]}
              radius={milesToMeters(provider.coverageRadiusMiles)}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.1, weight: 2 }}
            >
              <Popup>
                <strong>{provider.name}</strong>
                <br />
                {label}
              </Popup>
            </Circle>,
            <CircleMarker
              key={`${provider.id}-marker`}
              center={[lat, lon]}
              radius={6}
              pathOptions={{ color, fillColor: color, fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <strong>{provider.name}</strong>
                <br />
                {label}
              </Popup>
            </CircleMarker>,
          ];
        })}
      </MapContainer>
    </div>
  );
}
