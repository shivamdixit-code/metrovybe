"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Listing } from "@/lib/api";

import "leaflet/dist/leaflet.css";

type ExploreMapProps = {
  listings: Listing[];
};

const MAP_STYLES = {
  standard: {
    name: "Standard",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors',
  },
  light: {
    name: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
} as const;


const markerIcon = L.divIcon({
  className: "metrovybe-marker",
  html: `
    <div class="metro-marker">
      <div class="metro-marker-dot"></div>
    </div>
  `,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
  popupAnchor: [0, -42],
});

const featuredMarkerIcon = L.divIcon({
  className: "metrovybe-marker",
  html: `
    <div class="metro-marker metro-marker-featured">
      <div class="metro-marker-dot"></div>
    </div>
  `,
  iconSize: [42, 50],
  iconAnchor: [21, 50],
  popupAnchor: [0, -46],
});

const userLocationIcon = L.divIcon({
  className: "metrovybe-user-location",
  html: `
    <div style="
      position: relative;
      width: 54px;
      height: 70px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      background: transparent;
    ">

      <!-- soft ground shadow -->
      <div style="
        position: absolute;
        bottom: 1px;
        left: 50%;
        transform: translateX(-50%);
        width: 27px;
        height: 7px;
        border-radius: 50%;
        background: rgba(0,0,0,0.30);
        filter: blur(3px);
      "></div>

      <svg
        width="46"
        height="66"
        viewBox="0 0 80 112"
        xmlns="http://www.w3.org/2000/svg"
        style="
          position: relative;
          z-index: 2;
          overflow: visible;
          filter:
            drop-shadow(0 2px 2px rgba(0,0,0,0.20))
            drop-shadow(0 5px 5px rgba(0,0,0,0.16));
        "
      >

        <defs>

          <!-- main blue 3D material -->
          <linearGradient id="mvBody3D"
            x1="12%" y1="5%"
            x2="88%" y2="95%">
            <stop offset="0%" stop-color="#8cc8ff"/>
            <stop offset="20%" stop-color="#4ca0ff"/>
            <stop offset="48%" stop-color="#1677ff"/>
            <stop offset="78%" stop-color="#075acb"/>
            <stop offset="100%" stop-color="#03449d"/>
          </linearGradient>

          <!-- darker side -->
          <linearGradient id="mvSide"
            x1="0%" y1="0%"
            x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0755bd"/>
            <stop offset="100%" stop-color="#023b8d"/>
          </linearGradient>

          <!-- glossy highlight -->
          <linearGradient id="mvGloss"
            x1="0%" y1="0%"
            x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.62"/>
            <stop offset="35%" stop-color="#ffffff" stop-opacity="0.18"/>
            <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
          </linearGradient>

        </defs>

        <!-- HEAD -->
        <circle
          cx="40"
          cy="12"
          r="10"
          fill="url(#mvBody3D)"
        />

        <!-- subtle face/head highlight -->
        <ellipse
          cx="36"
          cy="9"
          rx="4"
          ry="5"
          fill="#ffffff"
          opacity="0.18"
        />

        <!-- NECK -->
        <path
          d="M35 20
             C35 18 37 17 40 17
             C43 17 45 18 45 20
             L45 27
             L35 27 Z"
          fill="url(#mvSide)"
        />

        <!-- TORSO -->
        <path
          d="M30 23
             C33 21 36 20 40 20
             C44 20 47 21 50 23
             C53 26 55 33 56 42
             L59 58
             C59 61 57 63 54 63
             H26
             C23 63 21 61 21 58
             L24 42
             C25 33 27 26 30 23 Z"
          fill="url(#mvBody3D)"
        />

        <!-- left arm -->
        <path
          d="M26 25
             C24 25 22 27 21 29
             L10 49
             C9 52 10 55 13 56
             C16 57 18 55 19 53
             L31 34
             Z"
          fill="url(#mvBody3D)"
        />

        <!-- right arm -->
        <path
          d="M54 25
             C56 25 58 27 59 29
             L70 49
             C71 52 70 55 67 56
             C64 57 62 55 61 53
             L49 34
             Z"
          fill="url(#mvSide)"
        />

        <!-- LEFT LEG -->
        <path
          d="M24 57
             C28 58 33 58 39 58
             L37 82
             L35 101
             C35 105 32 108 28 108
             H23
             C20 108 18 105 19 102
             L23 80 Z"
          fill="url(#mvBody3D)"
        />

        <!-- RIGHT LEG -->
        <path
          d="M41 58
             C47 58 52 58 56 57
             L57 80
             L61 102
             C62 105 60 108 57 108
             H52
             C48 108 45 105 45 101
             L43 82 Z"
          fill="url(#mvSide)"
        />

        <!-- torso glossy 3D highlight -->
        <path
          d="M31 24
             C28 26 27 31 26 37
             L23 55
             H31
             L35 34
             C36 29 37 25 40 22
             C36 22 33 23 31 24 Z"
          fill="url(#mvGloss)"
        />

        <!-- left leg highlight -->
        <path
          d="M25 61
             L31 61
             L28 96
             C28 100 27 103 25 105
             H21
             L25 78 Z"
          fill="#ffffff"
          opacity="0.12"
        />

      </svg>
    </div>
  `,
  iconSize: [54, 70],
  iconAnchor: [27, 70],
});;;

function MyLocationButton({
  onLocation,
}: {
  onLocation: (latitude: number, longitude: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: "bottomright" });

    control.onAdd = () => {
      const button = L.DomUtil.create(
        "button",
        "metro-location-control"
      );

      button.type = "button";
      button.setAttribute("aria-label", "Use my location");
      button.setAttribute("title", "Use my location");

      button.innerHTML = `
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- head -->
          <circle cx="12" cy="4.5" r="2.2" fill="currentColor"/>

          <!-- body -->
          <path
            d="M9.3 8.2C9.3 7.35 10.0 6.7 10.8 6.7H13.2C14.0 6.7 14.7 7.35 14.7 8.2V14.1H9.3V8.2Z"
            fill="currentColor"
          />

          <!-- left arm -->
          <path
            d="M9.6 8.2L6.8 12.2L8.0 13.0L10.8 9.8L9.6 8.2Z"
            fill="currentColor"
          />

          <!-- right arm -->
          <path
            d="M14.4 8.2L17.2 12.2L16.0 13.0L13.2 9.8L14.4 8.2Z"
            fill="currentColor"
          />

          <!-- left leg -->
          <path
            d="M9.4 13.2L10.9 13.2L10.3 20.3H8.5L9.4 13.2Z"
            fill="currentColor"
          />

          <!-- right leg -->
          <path
            d="M13.1 13.2L14.6 13.2L15.5 20.3H13.7L13.1 13.2Z"
            fill="currentColor"
          />

          <!-- feet -->
          <path
            d="M8.2 19.8H10.5V21H7.5C7.5 20.35 7.8 19.8 8.2 19.8Z"
            fill="currentColor"
          />
          <path
            d="M13.5 19.8H15.8C16.2 19.8 16.5 20.35 16.5 21H13.5V19.8Z"
            fill="currentColor"
          />
        </svg>
      `;

      L.DomEvent.disableClickPropagation(button);

      L.DomEvent.on(button, "click", () => {
        if (!navigator.geolocation) {
          alert("Location is not supported by this browser.");
          return;
        }

        button.style.opacity = "0.6";

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            map.flyTo(
              [latitude, longitude],
              15,
              {
                duration: 1.2,
              }
            );

            onLocation(latitude, longitude);

            button.style.opacity = "1";
          },
          () => {
            button.style.opacity = "1";

            alert(
              "Unable to access your location. Please allow location access."
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
          }
        );
      });

      return button;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, onLocation]);

  return null;
}



export default function ExploreMap({

  listings,
}: ExploreMapProps) {
  const [mapStyle, setMapStyle] =
    useState<keyof typeof MAP_STYLES>("standard");
  const [userLocation, setUserLocation] = useState<
    [number, number] | null
  >(null);

  const mappedListings = listings.filter(
    (listing) =>
      typeof listing.latitude === "number" &&
      typeof listing.longitude === "number"
  );

  return (
    <div className="metro-map-shell">
      <div className="metrovybe-map-layers">
        <button
          type="button"
          className="metrovybe-layers-button"
          onClick={() => {
            const el = document.querySelector(".metrovybe-layer-menu");
            if (el) el.classList.toggle("open");
          }}
          aria-label="Change map style"
        >
          <span className="metrovybe-layers-icon">◈</span>
          <span>Layers</span>
        </button>

        <div className="metrovybe-layer-menu">
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <button
              key={key}
              type="button"
              className={mapStyle === key ? "active" : ""}
              onClick={() => {
                setMapStyle(key as keyof typeof MAP_STYLES);
                document
                  .querySelector(".metrovybe-layer-menu")
                  ?.classList.remove("open");
              }}
            >
              {style.name}
              {mapStyle === key && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="metro-map-topbar">
        <div>
          <span className="metro-map-eyebrow">
            METROVYBE MAP
          </span>

          <strong>
            Around you
          </strong>
        </div>

        <div className="metro-map-count">
          {mappedListings.length} places
        </div>
      </div>

      


<MapContainer
        center={[28.5355, 77.391]}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
        className="metro-map"
      >
        <TileLayer
          key={mapStyle}
          attribution={MAP_STYLES[mapStyle].attribution}
          url={MAP_STYLES[mapStyle].url}
        />

        <ZoomControl position="bottomright" />

        <MyLocationButton
          onLocation={(latitude, longitude) =>
            setUserLocation([latitude, longitude])
          }
        />

        {userLocation && (
          <Marker
            position={userLocation}
            icon={userLocationIcon}
          >
            <Popup>
              <strong>You are here</strong>
            </Popup>
          </Marker>
        )}

        {mappedListings.map((listing) => (
          <Marker
            key={listing.id}
            position={[
              listing.latitude as number,
              listing.longitude as number,
            ]}
            icon={
              listing.featured
                ? featuredMarkerIcon
                : markerIcon
            }
          >
            <Popup className="metro-popup">
              <div className="metro-popup-card">
                {listing.image && (
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="metro-popup-image"
                  />
                )}

                <div className="metro-popup-content">
                  {listing.featured && (
                    <div className="metro-popup-featured">
                      ★ FEATURED
                    </div>
                  )}

                  <div className="metro-popup-title">
                    {listing.title}
                  </div>

                  <div className="metro-popup-location">
                    <span>●</span>
                    {listing.location}
                  </div>

                  <div className="metro-popup-bottom">
                    <strong>
                      {listing.price}
                    </strong>

                    <Link
                      href={`/listing/${listing.id}`}
                      className="metro-popup-link"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


/* MetroVybe map layer switcher */
