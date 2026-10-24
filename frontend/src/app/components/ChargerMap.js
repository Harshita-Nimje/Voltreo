"use client";

import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const chargerIcon = new L.DivIcon({
    className: "",
    html: `
    <div style="
      background:#B5FFCE;
      color:#102019;
      width:38px;
      height:38px;
      border-radius:50%;
      border:3px solid #102019;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
      box-shadow:0 4px 14px rgba(0,0,0,.35);
    ">⚡</div>
  `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
});

function MapResizeHandler() {
    const map = useMap();

    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

export default function ChargerMap({
    chargers = [],
    onSelectCharger,
}) {
    const [mapCenter] = useState([21.1458, 79.0882]);

    return (
        <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-white/10">
            <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom
                className="h-full w-full"
            >
                <MapResizeHandler />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {chargers.map((charger) => {
                    const lat = Number(charger.latitude);
                    const lng = Number(charger.longitude);

                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                        return null;
                    }

                    return (
                        <Marker
                            key={charger.id}
                            position={[lat, lng]}
                            icon={chargerIcon}
                            eventHandlers={{
                                click: () => onSelectCharger?.(charger),
                            }}
                        >
                            <Popup>
                                <strong>{charger.title}</strong>
                                <p>{charger.address}</p>
                                <p>₹{charger.price_per_hour}/hour</p>
                                <button
                                    onClick={() => onSelectCharger?.(charger)}
                                    style={{
                                        background: "#B5FFCE",
                                        color: "#102019",
                                        padding: "7px 12px",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    View charger
                                </button>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}