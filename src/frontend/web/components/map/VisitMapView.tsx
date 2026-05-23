"use client";

import type { JobVisit } from "@/lib/api";
import type { MapCoverageArea } from "@/lib/map-utils";
import { DEFAULT_MAP_CENTER, milesToMeters, visitMarkerColor } from "@/lib/map-utils";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { FitBounds } from "@/components/map/FitBounds";
import { MapInvalidateSize } from "@/components/map/MapInvalidateSize";
import { MAP_ATTRIBUTION, MAP_STYLE, MAP_TILE_URL } from "@/components/map/map-tiles";

type LocatedVisit = JobVisit & { latitude: number; longitude: number };

function formatStatus(status: string) {
  return status.replace(/([A-Z])/g, " $1").trim();
}

export function VisitMapView({
  visits,
  coverageAreas,
}: {
  visits: LocatedVisit[];
  coverageAreas: MapCoverageArea[];
}) {
  const positions: [number, number][] = [
    ...visits.map((v) => [v.latitude, v.longitude] as [number, number]),
    ...coverageAreas.map((a) => [a.latitude, a.longitude] as [number, number]),
  ];

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
        {coverageAreas.map((area) => (
          <Circle
            key={`${area.latitude}-${area.longitude}-${area.radiusMiles}`}
            center={[area.latitude, area.longitude]}
            radius={milesToMeters(area.radiusMiles)}
            pathOptions={{
              color: "#059669",
              fillColor: "#059669",
              fillOpacity: 0.08,
              weight: 2,
            }}
          >
            {area.label && (
              <Popup>
                <strong>{area.label}</strong>
                <br />
                {area.radiusMiles} mile radius
              </Popup>
            )}
          </Circle>
        ))}
        {visits.map((visit) => {
          const color = visitMarkerColor(visit.status);
          const date = visit.scheduledDate.slice(0, 10);

          return (
            <CircleMarker
              key={visit.id}
              center={[visit.latitude, visit.longitude]}
              radius={8}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{visit.postcode}</strong>
                <br />
                {date} · {visit.availabilityWindow}
                <br />
                Status: {formatStatus(visit.status)}
                {visit.assignedProviderName && (
                  <>
                    <br />
                    Gardener: {visit.assignedProviderName}
                  </>
                )}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
