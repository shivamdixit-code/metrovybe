import { getUser } from "@/lib/auth";

export type CustomerCoordinates = {
  latitude: number;
  longitude: number;
  source: "profile" | "gps";
};

export function getProfileCoordinates(): CustomerCoordinates | null {
  if (typeof window === "undefined") return null;

  const user = getUser();

  if (user?.role !== "customer") return null;

  const latitude = Number(user.location?.latitude);
  const longitude = Number(user.location?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    source: "profile",
  };
}

export function getBrowserCoordinates(): Promise<CustomerCoordinates | null> {
  if (
    typeof window === "undefined" ||
    !navigator.geolocation
  ) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude);
        const longitude = Number(position.coords.longitude);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          resolve(null);
          return;
        }

        resolve({
          latitude,
          longitude,
          source: "gps",
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  });
}

export async function resolveCustomerCoordinates(): Promise<CustomerCoordinates | null> {
  // Saved profile location works even when browser location permission is denied.
  const profile = getProfileCoordinates();

  if (profile) {
    return profile;
  }

  // GPS is only an optional fallback.
  return getBrowserCoordinates();
}
