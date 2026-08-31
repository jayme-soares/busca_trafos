"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Trafo } from "@/lib/trafos";
import { googleMapsPointUrl } from "@/lib/trafos";
import { copyToClipboard } from "@/lib/clipboard";

// Ícones em SVG inline: evita depender de imagens externas para os pins
// (só os tiles do mapa vêm da rede) e permite destacar o trafo selecionado.
function pinIcon(color: string, size: number) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"
         style="filter: drop-shadow(0 2px 2px rgba(0,0,0,.45));">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}"/>
      <circle cx="12" cy="12" r="4.5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, (size * 32) / 24],
    iconAnchor: [size / 2, (size * 32) / 24],
    popupAnchor: [0, -(size * 32) / 24],
  });
}

const defaultIcon = pinIcon("#2563eb", 28);
const selectedIcon = pinIcon("#dc2626", 36);

const RIO_CENTER: [number, number] = [-22.9, -42.8];

function PopupContent({ t }: { t: Trafo }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(`${t.lat}, ${t.lng}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="text-sm">
      <div className="font-semibold">{t.name}</div>
      <div className="flex items-center gap-2 text-gray-600">
        <span>
          {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar coordenada"
          className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          {copied ? "✓ Copiado" : "📋 Copiar"}
        </button>
      </div>
      <a
        href={googleMapsPointUrl(t)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-blue-600 underline"
      >
        Abrir no Google Maps
      </a>
    </div>
  );
}

function FitToResults({ trafos }: { trafos: Trafo[] }) {
  const map = useMap();
  useEffect(() => {
    if (trafos.length === 0) return;
    if (trafos.length === 1) {
      map.setView([trafos[0].lat, trafos[0].lng], 16, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(trafos.map((t) => [t.lat, t.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trafos.map((t) => t.name).join("|")]);
  return null;
}

function FlyToSelected({ selected }: { selected: Trafo | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), {
        duration: 0.7,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.name]);
  return null;
}

export default function MapView({
  results,
  selected,
  onSelect,
}: {
  results: Trafo[];
  selected: Trafo | null;
  onSelect: (t: Trafo) => void;
}) {
  const markerRefs = useRef(new Map<string, L.Marker>());

  useEffect(() => {
    if (!selected) return;
    const marker = markerRefs.current.get(selected.name);
    marker?.openPopup();
  }, [selected]);

  return (
    <MapContainer
      center={RIO_CENTER}
      zoom={10}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToResults trafos={results} />
      <FlyToSelected selected={selected} />
      {results.map((t) => (
        <Marker
          key={t.name}
          position={[t.lat, t.lng]}
          icon={selected?.name === t.name ? selectedIcon : defaultIcon}
          eventHandlers={{ click: () => onSelect(t) }}
          ref={(el) => {
            if (el) markerRefs.current.set(t.name, el);
            else markerRefs.current.delete(t.name);
          }}
        >
          <Popup>
            <PopupContent t={t} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
