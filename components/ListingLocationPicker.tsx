"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationValue = {
  latitude: number;
  longitude: number;
};

type SelectedLocation = LocationValue & {
  address: string;
};

type Props = {
  initialLocation?: LocationValue;
  onConfirm: (location: SelectedLocation) => void;
};

const DEFAULT_LOCATION: LocationValue = {
  latitude: 28.6139,
  longitude: 77.209,
};

const PIN_ICON = new L.DivIcon({
  className: "metro-location-pin",
  html: `
    <div class="metro-pin-wrap">
      <div class="metro-pin">
        <div class="metro-pin-dot"></div>
      </div>
      <div class="metro-pin-shadow"></div>
    </div>
  `,
  iconSize: [44, 56],
  iconAnchor: [22, 48],
});

const MAP_MODES = {
  standard: {
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  light: {
    label: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; Stadia Maps",
  },
  dark: {
    label: "Dark",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

function MapController({
  center,
  locationVersion,
}: {
  center: LocationValue;
  locationVersion: number;
}) {
  const map = useMap();

  useEffect(() => {
    const lat = Number(center.latitude);
    const lng = Number(center.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    map.stop();

    map.flyTo([lat, lng], 18, {
      animate: true,
      duration: 0.8,
    });
  }, [
    center.latitude,
    center.longitude,
    locationVersion,
    map,
  ]);

  return null;
}

function MapClickHandler({
  onMove,
}: {
  onMove: (location: LocationValue) => void;
}) {
  useMapEvents({
    click(event) {
      onMove({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function ListingLocationPicker({
  initialLocation,
  onConfirm,
}: Props) {
  const [position, setPosition] = useState<LocationValue>(
    initialLocation || DEFAULT_LOCATION
  );

  const [locationVersion, setLocationVersion] = useState(0);

  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mapMode, setMapMode] =
    useState<keyof typeof MAP_MODES>("standard");

  const tile = useMemo(
    () => MAP_MODES[mapMode],
    [mapMode]
  );

  async function reverseGeocode(
    latitude: number,
    longitude: number
  ) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch address");
      }

      const data = await response.json();

      setAddress(
        data.display_name ||
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      );
    } catch {
      setAddress(
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      );
    }
  }

  function movePin(next: LocationValue) {
    const lat = Number(next.latitude);
    const lng = Number(next.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    setPosition({
      latitude: lat,
      longitude: lng,
    });

    setLocationVersion((value) => value + 1);
    setError("");

    reverseGeocode(lat, lng);
  }

  useEffect(() => {
    reverseGeocode(
      position.latitude,
      position.longitude
    );
  }, []);

  async function searchAddress() {
    const query = search.trim();

    if (!query) return;

    setSearching(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const results = await response.json();

      if (!results.length) {
        throw new Error(
          "Address not found. Try a nearby landmark or complete address."
        );
      }

      const next = {
        latitude: Number(results[0].lat),
        longitude: Number(results[0].lon),
      };

      setPosition(next);
      setAddress(results[0].display_name || query);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to find this address."
      );
    } finally {
      setSearching(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const next = {
          latitude: Number(location.coords.latitude),
          longitude: Number(location.coords.longitude),
        };

        if (
          !Number.isFinite(next.latitude) ||
          !Number.isFinite(next.longitude)
        ) {
          setLocating(false);
          setError("Invalid GPS coordinates received.");
          return;
        }

        // Update the marker and force MapController to
        // recenter the actual Leaflet map on this GPS point.
        setPosition(next);
        setLocationVersion((value) => value + 1);

        reverseGeocode(
          next.latitude,
          next.longitude
        ).finally(() => {
          setLocating(false);
        });
      },
      (err) => {
        setLocating(false);

        if (err.code === 1) {
          setError(
            "Location permission was denied. Please allow location access in your browser."
          );
        } else if (err.code === 2) {
          setError(
            "Your current location could not be determined."
          );
        } else {
          setError(
            "Unable to get your current location. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  function confirmLocation() {
    if (!address.trim()) {
      setError("Please select a valid location first.");
      return;
    }

    setSaving(true);

    onConfirm({
      latitude: position.latitude,
      longitude: position.longitude,
      address,
    });

    setSaving(false);
  }

  return (
    <div className="listing-location-picker">
      <div className="picker-top"></div>

      <div className="map-area">
        <div className="map-search-overlay customer-map-search">
          <div className="search-row">
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    searchAddress();
                  }
                }}
                placeholder="Search your business address"
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="button"
              className="search-button"
              onClick={searchAddress}
              disabled={searching}
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
        </div>
        <MapContainer
          center={[
            position.latitude,
            position.longitude,
          ]}
          zoom={17}
          zoomControl={false}
          scrollWheelZoom
          className="listing-picker-map"
        >
          <TileLayer
            attribution={tile.attribution}
            url={tile.url}
          />

          <MapController
            center={position}
            locationVersion={locationVersion}
          />

          <MapClickHandler onMove={movePin} />

          <Marker
            position={[
              position.latitude,
              position.longitude,
            ]}
            icon={PIN_ICON}
            draggable
            eventHandlers={{
              dragend(event) {
                const marker =
                  event.target as L.Marker;

                const next = marker.getLatLng();

                movePin({
                  latitude: next.lat,
                  longitude: next.lng,
                });
              },
            }}
          />
        </MapContainer>

        <button
          type="button"
          className="floating-location-button customer-location-button"
          onClick={useMyLocation}
          disabled={locating}
          aria-label="Use my location"
          title="Use my location"
        >
          <span className={locating ? "location-spinner" : ""}>
            ◎
          </span>
        </button>

        <div className="map-mode-control">
          {(
            Object.keys(MAP_MODES) as Array<
              keyof typeof MAP_MODES
            >
          ).map((mode) => (
            <button
              type="button"
              key={mode}
              className={
                mapMode === mode ? "active" : ""
              }
              onClick={() => setMapMode(mode)}
            >
              {mode === "standard" && "▦"}
              {mode === "light" && "☼"}
              {mode === "dark" && "◐"}
              {mode === "satellite" && "▧"}
              <span>{MAP_MODES[mode].label}</span>
            </button>
          ))}
        </div>

        <div className="map-help">
          <span className="help-pin">●</span>
          Tap the map or drag the pin to the exact place
        </div>
      </div>

      <div className="location-bottom">
        <div className="address-preview">
          <div className="address-icon">⌖</div>

          <div>
            <small>BUSINESS LOCATION</small>

            <strong>
              {address ||
                "Move the pin to select your location"}
            </strong>

            <span>
              {position.latitude.toFixed(6)},{" "}
              {position.longitude.toFixed(6)}
            </span>
          </div>
        </div>

        {error && (
          <div className="picker-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="confirm-location"
          onClick={confirmLocation}
          disabled={saving || !address}
        >
          {saving
            ? "Saving..."
            : "Confirm business location"}
          <span>→</span>
        </button>
      </div>

      <style jsx global>{`
        .listing-location-picker {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f7f8f7;
          color: #151918;
          overflow: hidden;
        }

        .picker-top {
          padding: 12px;
          background: #fff;
          border-bottom: 1px solid #e7ebe9;
          position: relative;
          z-index: 1000;
        }

        .map-area {
          position: relative;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .map-search-overlay {
          position: absolute !important;
          top: 12px !important;
          right: 12px !important;
          left: auto !important;
          width: min(360px, calc(100% - 24px)) !important;
          z-index: 2000 !important;
          pointer-events: none;
        }

        .map-search-overlay .search-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0;
          pointer-events: auto;
        }

        .map-search-overlay .search-box {
          flex: 1;
          min-width: 0;
          height: 42px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          background: rgba(255,255,255,.97);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 13px;
          box-shadow: 0 4px 16px rgba(0,0,0,.14);
          overflow: hidden;
        }

        .map-search-overlay .search-button {
          flex-shrink: 0;
          height: 42px;
          padding: 0 14px;
          border: 0;
          border-radius: 13px;
          background: #176b55;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(23,107,85,.25);
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .map-search-overlay {
            top: 10px !important;
            right: 10px !important;
            left: auto !important;
            width: calc(100% - 20px) !important;
          }

          .map-search-overlay .search-box,
          .map-search-overlay .search-button {
            height: 40px;
          }

          .map-search-overlay .search-button {
            padding: 0 12px;
          }
        }

        .map-area .listing-picker-map {
          width: 100%;
          height: 100%;
          min-height: 420px;
        }

        .map-area .floating-location-button {
          position: absolute;
          z-index: 1000;
        }

        .map-area .map-mode-control {
          position: absolute;
          z-index: 1000;
          pointer-events: auto;
        }

        .map-area .map-help {
          position: absolute;
          z-index: 1000;
        }

        .map-mode-control button {
          cursor: pointer;
        }

        .map-mode-control button.active {
          font-weight: 800;
        }

        @media (max-width: 600px) {
          .map-area .listing-picker-map {
            min-height: 390px;
          }
        }

        .map-search-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 1000;
          pointer-events: none;
        }

        .map-search-overlay .search-row {
          margin: 0;
          pointer-events: auto;
        }

        .map-search-overlay .search-box {
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid rgba(0, 0, 0, 0.07);
          border-radius: 16px;
          box-shadow: 0 5px 18px rgba(0, 0, 0, 0.14);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        @media (max-width: 600px) {
          .map-search-overlay {
            top: 10px;
            left: 10px;
            right: 10px;
          }
        }

        .search-row {
          display: flex;
          gap: 8px;
        }

        .search-box {
          flex: 1;
          min-width: 0;
          height: 48px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          background: #f5f7f6;
          border: 1px solid #e0e5e3;
          border-radius: 14px;
        }

        .search-icon {
          font-size: 22px;
          color: #68716e;
          transform: rotate(-20deg);
        }

        .search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font: inherit;
          font-size: 14px;
          color: #151918;
        }

        .search-box input::placeholder {
          color: #929a97;
        }

        .clear-search {
          border: 0;
          background: transparent;
          color: #777;
          font-size: 20px;
          cursor: pointer;
        }

        .search-button {
          height: 48px;
          padding: 0 15px;
          border: 0;
          border-radius: 14px;
          background: #176b55;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }


        .map-area {
          position: relative;
          flex: 1;
          min-height: 360px;
        }

        .customer-map-search {
        position: absolute !important;
        top: 10px !important;
        left: 10px !important;
        right: 10px !important;
        z-index: 400 !important;
        pointer-events: none !important;
      }

      .customer-map-search .search-row {
        pointer-events: auto !important;
      }

      .customer-map-search .search-box {
        min-width: 0 !important;
      }

      .customer-map-search input {
        min-width: 0 !important;
      }

      .customer-location-button {
        position: absolute !important;
        right: 12px !important;
        bottom: 52px !important;
        z-index: 1000 !important;
        width: 42px !important;
        height: 42px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: #ffffff !important;
        border: 1px solid #d9dee5 !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 14px rgba(0,0,0,.18) !important;
        color: #168a6a !important;
      }

      .customer-location-button span {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        font-size: 22px !important;
        line-height: 1 !important;
      }

      .customer-map-search {
        position: absolute !important;
        top: 10px !important;
        left: 10px !important;
        right: 10px !important;
        z-index: 400 !important;
        pointer-events: none !important;
      }

      .customer-map-search .search-row {
        pointer-events: auto !important;
      }

      .customer-map-search .search-box {
        min-width: 0 !important;
      }

      .customer-map-search input {
        min-width: 0 !important;
      }

      .customer-location-button {
        position: absolute !important;
        right: 12px !important;
        bottom: 52px !important;
        z-index: 1000 !important;
        width: 42px !important;
        height: 42px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: #ffffff !important;
        border: 1px solid #d9dee5 !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 14px rgba(0,0,0,.18) !important;
        color: #168a6a !important;
      }

      .customer-location-button span {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        font-size: 22px !important;
        line-height: 1 !important;
      }

      .listing-picker-map {
          width: 100%;
          height: 100%;
          min-height: 360px;
          z-index: 1;
        }

        .floating-location-button {
          position: absolute;
          right: 14px;
          bottom: 58px;
          z-index: 600;
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.97);
          color: #176b55;
          box-shadow:
            0 3px 10px rgba(0, 0, 0, 0.18),
            0 1px 3px rgba(0, 0, 0, 0.12);
          font-size: 25px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .floating-location-button:hover {
          transform: scale(1.04);
          box-shadow:
            0 5px 15px rgba(0, 0, 0, 0.22),
            0 1px 4px rgba(0, 0, 0, 0.12);
        }

        .floating-location-button:active {
          transform: scale(0.94);
        }

        .floating-location-button:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .location-spinner {
          display: block;
          width: 20px;
          height: 20px;
          border: 2px solid #c8ddd5;
          border-top-color: #176b55;
          border-radius: 50%;
          animation: locationSpin 0.8s linear infinite;
          font-size: 0;
        }

        @keyframes locationSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .map-mode-control {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 500;
          display: flex;
          padding: 4px;
          gap: 3px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(10px);
        }

        .map-mode-control button {
          border: 0;
          background: transparent;
          color: #626a67;
          padding: 7px 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .map-mode-control button.active {
          background: #176b55;
          color: #fff;
        }

        .map-mode-control button span {
          display: inline;
        }

        .map-help {
          position: absolute;
          left: 50%;
          bottom: 13px;
          transform: translateX(-50%);
          z-index: 500;
          white-space: nowrap;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
          font-size: 11px;
          font-weight: 700;
          color: #3f4744;
          backdrop-filter: blur(8px);
        }

        .help-pin {
          color: #176b55;
          margin-right: 5px;
        }

        .location-bottom {
          padding: 13px;
          background: #fff;
          border-top: 1px solid #e7ebe9;
          position: relative;
          z-index: 1000;
        }

        .address-preview {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 10px;
        }

        .address-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #e9f5f0;
          color: #176b55;
          font-size: 20px;
          font-weight: 900;
        }

        .address-preview > div:last-child {
          min-width: 0;
          display: grid;
          gap: 2px;
        }

        .address-preview small {
          color: #176b55;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .address-preview strong {
          font-size: 13px;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .address-preview span {
          color: #858d8a;
          font-size: 10px;
        }

        .picker-error {
          margin-bottom: 9px;
          padding: 9px 11px;
          border-radius: 9px;
          background: #fff0f0;
          color: #9b2d2d;
          font-size: 12px;
          font-weight: 700;
        }

        .confirm-location {
          width: 100%;
          height: 50px;
          border: 0;
          border-radius: 14px;
          background: #151918;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .confirm-location span {
          font-size: 19px;
        }

        .confirm-location:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .metro-location-pin {
          background: transparent !important;
          border: 0 !important;
        }

        .metro-pin-wrap {
          position: relative;
          width: 44px;
          height: 56px;
        }

        .metro-pin {
          position: absolute;
          left: 6px;
          top: 0;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #176b55;
          border: 3px solid #fff;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
        }

        .metro-pin-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          border-radius: 50%;
          background: #fff;
        }

        .metro-pin-shadow {
          position: absolute;
          width: 24px;
          height: 7px;
          left: 10px;
          bottom: 5px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.22);
          filter: blur(2px);
        }

        .leaflet-control-attribution {
          font-size: 8px !important;
        }

        @media (max-width: 600px) {
          .picker-top {
            padding: 9px;
          }

          .search-row {
            gap: 6px;
          }

          .search-box {
            height: 46px;
            border-radius: 13px;
          }

          .search-button {
            height: 46px;
            padding: 0 12px;
            border-radius: 13px;
          }

          .my-location-button {
            height: 40px;
          }

          .map-area,
          .listing-picker-map {
            min-height: 330px;
          }

          .floating-location-button {
            right: 10px;
            bottom: 52px;
            width: 44px;
            height: 44px;
          }

          .map-mode-control {
            left: 8px;
            top: 8px;
            max-width: calc(100% - 16px);
            overflow-x: auto;
          }

          .map-mode-control button {
            padding: 7px;
            flex-shrink: 0;
          }

          .map-mode-control button span {
            display: none;
          }

          .map-help {
            bottom: 9px;
            max-width: calc(100% - 24px);
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .location-bottom {
            padding: 11px;
          }
        }
      `}</style>
    </div>
  );
}
