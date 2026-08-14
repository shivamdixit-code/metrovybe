"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";

type Location = {
  latitude: number;
  longitude: number;
};

type Props = {
  initialLocation?: Location;
  onConfirm: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

const DEFAULT_LOCATION: Location = {
  latitude: 28.6139,
  longitude: 77.209,
};

const pinIcon = L.divIcon({
  className: "metro-location-pin",
  html: `
    <div class="metro-pin">
      <div class="metro-pin-dot"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
});

function MapMover({
  latitude,
  longitude,
}: Location) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], 17, {
      duration: 0.6,
    });
  }, [latitude, longitude, map]);

  return null;
}

function MapClick({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

function CurrentLocationButton({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [loading, setLoading] =
    useState(false);

  function locate() {
    if (!navigator.geolocation) {
      alert("Location services are unavailable.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;
        const lng =
          position.coords.longitude;

        map.flyTo([lat, lng], 17, {
          duration: 0.7,
        });

        onSelect(lat, lng);
        setLoading(false);
      },
      () => {
        setLoading(false);
        alert(
          "Unable to get your location. Please search for your address."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  return (
    <button
      type="button"
      className="current-location"
      onClick={locate}
      disabled={loading}
      aria-label="Use my current location"
    >
      {loading ? "…" : "⌖"}
    </button>
  );
}

export default function ListingLocationPicker({
  initialLocation,
  onConfirm,
}: Props) {
  const [position, setPosition] =
    useState<Location>(
      initialLocation || DEFAULT_LOCATION
    );

  const [search, setSearch] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const [loadingAddress, setLoadingAddress] =
    useState(false);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);

      reverseGeocode(
        initialLocation.latitude,
        initialLocation.longitude
      );
    }
  }, []);

  async function reverseGeocode(
    latitude: number,
    longitude: number
  ) {
    setLoadingAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        await response.json();

      setAddress(
        data.display_name ||
          `${latitude.toFixed(
            6
          )}, ${longitude.toFixed(6)}`
      );
    } catch {
      setAddress(
        `${latitude.toFixed(
          6
        )}, ${longitude.toFixed(6)}`
      );
    } finally {
      setLoadingAddress(false);
    }
  }

  async function searchAddress() {
    const query = search.trim();

    if (!query) return;

    setSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const results =
        await response.json();

      if (!results.length) {
        setAddress(
          "Address not found. Try a more specific address."
        );
        return;
      }

      const result = results[0];

      const latitude = Number(
        result.lat
      );

      const longitude = Number(
        result.lon
      );

      setPosition({
        latitude,
        longitude,
      });

      setAddress(
        result.display_name ||
          `${latitude.toFixed(
            6
          )}, ${longitude.toFixed(6)}`
      );
    } catch {
      setAddress(
        "Unable to search this address."
      );
    } finally {
      setSearching(false);
    }
  }

  function selectPosition(
    latitude: number,
    longitude: number
  ) {
    setPosition({
      latitude,
      longitude,
    });

    reverseGeocode(
      latitude,
      longitude
    );
  }

  function confirmLocation() {
    onConfirm({
      latitude: position.latitude,
      longitude: position.longitude,
      address:
        address ||
        `${position.latitude.toFixed(
          6
        )}, ${position.longitude.toFixed(6)}`,
    });
  }

  return (
    <div className="location-picker">
      <MapContainer
        center={[
          position.latitude,
          position.longitude,
        ]}
        zoom={15}
        zoomControl={false}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapMover
          latitude={position.latitude}
          longitude={position.longitude}
        />

        <MapClick
          onSelect={selectPosition}
        />

        <Marker
          position={[
            position.latitude,
            position.longitude,
          ]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const marker =
                event.target as L.Marker;

              const location =
                marker.getLatLng();

              selectPosition(
                location.lat,
                location.lng
              );
            },
          }}
        />

        <CurrentLocationButton
          onSelect={selectPosition}
        />
      </MapContainer>

      <div className="search-bar">
        <span className="search-icon">
          ⌕
        </span>

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
            className="clear-button"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}

        <button
          type="button"
          className="search-button"
          onClick={searchAddress}
          disabled={searching}
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      <div className="bottom-sheet">
        <div className="sheet-handle" />

        <div className="eyebrow">
          BUSINESS LOCATION
        </div>

        <div className="address">
          {loadingAddress
            ? "Finding address..."
            : address ||
              "Search your address or move the pin"}
        </div>

        <div className="coordinates">
          {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)}
        </div>

        <p>
          Move the pin to the exact place
          customers should find your business.
        </p>

        <button
          type="button"
          className="confirm"
          onClick={confirmLocation}
          disabled={loadingAddress}
        >
          {loadingAddress
            ? "Finding location..."
            : "Confirm location"}
        </button>
      </div>

      <style jsx>{`
        .location-picker {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 560px;
          overflow: hidden;
          background: #e9eeec;
        }

        .search-bar {
          position: absolute;
          z-index: 1000;
          top: 14px;
          left: 14px;
          right: 14px;
          height: 52px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 7px 0 14px;
          border-radius: 17px;
          background: rgba(255,255,255,.98);
          box-shadow:
            0 5px 24px rgba(0,0,0,.16);
        }

        .search-icon {
          font-size: 23px;
          color: #69736f;
        }

        .search-bar input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #171b19;
        }

        .search-bar input::placeholder {
          color: #8a918e;
          font-weight: 500;
        }

        .clear-button {
          width: 27px;
          height: 27px;
          border: 0;
          border-radius: 50%;
          background: #edf0ef;
          color: #68716e;
          font-size: 18px;
          cursor: pointer;
        }

        .search-button {
          height: 38px;
          padding: 0 13px;
          border: 0;
          border-radius: 11px;
          background: #176b55;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .search-button:disabled {
          opacity: .6;
        }

        .current-location {
          position: absolute;
          z-index: 1000;
          right: 14px;
          top: 78px;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 14px;
          background: white;
          color: #176b55;
          font-size: 24px;
          box-shadow:
            0 4px 18px rgba(0,0,0,.18);
          cursor: pointer;
        }

        .bottom-sheet {
          position: absolute;
          z-index: 1000;
          left: 9px;
          right: 9px;
          bottom: 9px;
          padding: 10px 15px 15px;
          border-radius: 22px;
          background: rgba(255,255,255,.98);
          box-shadow:
            0 8px 32px rgba(0,0,0,.23);
          backdrop-filter: blur(14px);
        }

        .sheet-handle {
          width: 38px;
          height: 4px;
          margin: 0 auto 12px;
          border-radius: 20px;
          background: #d6dbd8;
        }

        .eyebrow {
          color: #176b55;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .8px;
        }

        .address {
          margin-top: 5px;
          color: #171c19;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 750;
        }

        .coordinates {
          margin-top: 4px;
          color: #969d99;
          font-size: 10px;
        }

        .bottom-sheet p {
          margin: 8px 0 12px;
          color: #747c78;
          font-size: 11px;
          line-height: 1.35;
        }

        .confirm {
          width: 100%;
          height: 47px;
          border: 0;
          border-radius: 13px;
          background: #176b55;
          color: white;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 4px 12px rgba(23,107,85,.2);
        }

        .confirm:disabled {
          opacity: .55;
        }

        :global(.metro-location-pin) {
          background: transparent !important;
          border: 0 !important;
        }

        :global(.metro-pin) {
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          background: #176b55;
          border: 3px solid white;
          box-shadow:
            0 4px 14px rgba(0,0,0,.3);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.metro-pin-dot) {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: white;
        }

        @media (max-width: 600px) {
          .location-picker {
            min-height: 530px;
          }

          .search-bar {
            top: 10px;
            left: 10px;
            right: 10px;
            height: 49px;
            border-radius: 16px;
          }

          .search-bar input {
            font-size: 13px;
          }

          .search-button {
            padding: 0 11px;
          }

          .current-location {
            top: 70px;
            right: 10px;
          }

          .bottom-sheet {
            left: 7px;
            right: 7px;
            bottom: 7px;
            border-radius: 21px;
          }
        }
      `}</style>
    </div>
  );
}
