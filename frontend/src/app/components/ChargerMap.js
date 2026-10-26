"use client";

import { useEffect, useRef } from "react";
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

export default function ChargerMap({
    chargers = [],
    onSelectCharger,
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(null);
    const onSelectRef = useRef(onSelectCharger);

    useEffect(() => {
        onSelectRef.current = onSelectCharger;
    }, [onSelectCharger]);

    // Create the map once and clean it up when unmounted.
    useEffect(() => {
        const container = containerRef.current;

        if (!container || mapRef.current) return;

        const map = L.map(container, {
            center: [21.1458, 79.0882],
            zoom: 12,
            scrollWheelZoom: true,
        });

        mapRef.current = map;

        const tileLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }
        ).addTo(map);

        // Give the map a dark appearance without an API key.


        markersRef.current = L.layerGroup().addTo(map);

        const timer = setTimeout(() => {
            if (mapRef.current === map) {
                map.invalidateSize();
            }
        }, 150);

        return () => {
            clearTimeout(timer);

            if (mapRef.current === map) {
                map.remove();
                mapRef.current = null;
                markersRef.current = null;
            }
        };
    }, []);

    // Update markers when charger data changes.
    useEffect(() => {
        const map = mapRef.current;
        const markerLayer = markersRef.current;

        if (!map || !markerLayer) return;

        markerLayer.clearLayers();

        const validChargers = chargers
            .map((charger) => ({
                charger,
                lat: Number(charger.latitude),
                lng: Number(charger.longitude),
            }))
            .filter(({ lat, lng }) =>
                Number.isFinite(lat) &&
                Number.isFinite(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180
            );

        validChargers.forEach(({ charger, lat, lng }) => {
            const sameLocation = validChargers.filter(
                (item) => item.lat === lat && item.lng === lng
            );

            const index = sameLocation.findIndex(
                (item) => item.charger.id === charger.id
            );

            const offset = sameLocation.length > 1
                ? (index - (sameLocation.length - 1) / 2) * 0.0003
                : 0;

            const marker = L.marker(
                [lat + offset, lng + offset],
                { icon: chargerIcon }
            );

            const popup = L.popup().setContent(
                `<div>
                    <strong>${escapeHtml(charger.title)}</strong>
                    <p>${escapeHtml(charger.address)}</p>
                    <p>₹${escapeHtml(charger.price_per_hour)}/hour</p>
                    <button
                        type="button"
                        class="voltreo-view-charger"
                        style="
                            background:#B5FFCE;
                            color:#102019;
                            padding:7px 12px;
                            border-radius:8px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >View charger</button>
                </div>`
            );

            marker.bindPopup(popup);

            marker.on("click", () => {
                onSelectRef.current?.(charger);
            });

            marker.on("popupopen", (event) => {
                const button = event.popup
                    .getElement()
                    ?.querySelector(".voltreo-view-charger");

                if (!button) return;

                button.onclick = () => {
                    onSelectRef.current?.(charger);
                    map.closePopup();
                };
            });

            markerLayer.addLayer(marker);
        });
    }, [chargers]);

    return (
        <div
            ref={containerRef}
            className="relative z-0 h-[500px] w-full overflow-hidden rounded-2xl border border-white/10"
        />
    );
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);
}