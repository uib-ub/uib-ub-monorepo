export type CameraBounds = [[number, number], [number, number]] // [[north, west], [south, east]]

export interface UrlCameraV1 {
  v: 1;
  mode: 'center' | 'bounds';
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  bearing?: number;
  pitch?: number;
  bounds?: CameraBounds;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isLatLng = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  isFiniteNumber(value[0]) &&
  isFiniteNumber(value[1]);

const isBounds = (value: unknown): value is CameraBounds =>
  Array.isArray(value) &&
  value.length === 2 &&
  isLatLng(value[0]) &&
  isLatLng(value[1]);

function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export const parseCameraParam = (value: string | null): UrlCameraV1 | null => {
  if (!value) return null;
  try {
    const decoded = decodeBase64Url(value);
    const parsed = JSON.parse(decoded) as Partial<UrlCameraV1>;
    if (parsed.v !== 1) return null;
    if (parsed.mode !== 'center' && parsed.mode !== 'bounds') return null;

    const result: UrlCameraV1 = {
      v: 1,
      mode: parsed.mode,
    };

    if (isLatLng(parsed.center)) {
      result.center = [round(parsed.center[0], 6), round(parsed.center[1], 6)];
    }
    if (isFiniteNumber(parsed.zoom)) {
      result.zoom = round(parsed.zoom, 2);
    }
    if (isFiniteNumber(parsed.bearing)) {
      result.bearing = round(parsed.bearing, 1);
    }
    if (isFiniteNumber(parsed.pitch)) {
      result.pitch = round(parsed.pitch, 1);
    }
    if (isBounds(parsed.bounds)) {
      result.bounds = [
        [round(parsed.bounds[0][0], 6), round(parsed.bounds[0][1], 6)],
        [round(parsed.bounds[1][0], 6), round(parsed.bounds[1][1], 6)],
      ];
    }
    if (parsed.padding && typeof parsed.padding === 'object') {
      const { top, right, bottom, left } = parsed.padding as Record<string, unknown>;
      if (
        isFiniteNumber(top) &&
        isFiniteNumber(right) &&
        isFiniteNumber(bottom) &&
        isFiniteNumber(left)
      ) {
        result.padding = { top, right, bottom, left };
      }
    }
    return result;
  } catch {
    return null;
  }
};

export const serializeCameraParam = (camera: UrlCameraV1): string => {
  const clean: UrlCameraV1 = {
    v: 1,
    mode: camera.mode,
    ...(camera.center ? { center: [round(camera.center[0], 6), round(camera.center[1], 6)] } : {}),
    ...(isFiniteNumber(camera.zoom) ? { zoom: round(camera.zoom, 2) } : {}),
    ...(isFiniteNumber(camera.bearing) ? { bearing: round(camera.bearing, 1) } : {}),
    ...(isFiniteNumber(camera.pitch) ? { pitch: round(camera.pitch, 1) } : {}),
    ...(camera.bounds
      ? {
          bounds: [
            [round(camera.bounds[0][0], 6), round(camera.bounds[0][1], 6)],
            [round(camera.bounds[1][0], 6), round(camera.bounds[1][1], 6)],
          ] as CameraBounds,
        }
      : {}),
    ...(camera.padding ? { padding: camera.padding } : {}),
  };
  return encodeBase64Url(JSON.stringify(clean));
};
