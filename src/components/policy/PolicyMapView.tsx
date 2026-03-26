import "@/lib/leafletInit";

import { LatLngBoundsExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

import { Policy } from "@/types/policy";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

function AutoFit({ policies }: { policies: Policy[] }) {
  const map = useMap();
  const bounds = useMemo(() => {
    const pts = policies.filter((p) => p.lat != null && p.lng != null);
    if (pts.length === 0) return null;
    const b: LatLngBoundsExpression = pts.map((p) => [p.lat!, p.lng!]);
    return b;
  }, [policies]);

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
  }, [bounds, map]);

  return null;
}

export function PolicyMapView({
  policies,
  selectedId,
  onSelect,
}: {
  policies: Policy[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const center: [number, number] = [35.8617, 104.1954];

  return (
    <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%" }} zoomControl>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AutoFit policies={policies} />
      {policies
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => (
          <Marker
            key={p.id}
            position={[p.lat!, p.lng!]}
            eventHandlers={{
              click: () => onSelect(p.id),
            }}
          />
        ))}
      {selectedId ? <MapFocus id={selectedId} /> : null}
    </MapContainer>
  );
}

function MapFocus({ id }: { id: string }) {
  const map = useMap();
  const policy = usePolicyMapStore((s) => s.policies.find((p) => p.id === id) ?? null);
  useEffect(() => {
    if (!policy?.lat || !policy?.lng) return;
    map.setView([policy.lat, policy.lng], 10, { animate: true });
  }, [map, policy]);
  return null;
}
