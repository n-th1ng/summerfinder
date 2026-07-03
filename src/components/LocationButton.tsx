'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';

type Status = 'idle' | 'requesting' | 'success' | 'denied' | 'error';

export type ResolvedLocation = {
  city: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
};

type Props = {
  /** Called with the resolved city + coords when the user grants permission. */
  onResolved: (loc: ResolvedLocation) => void;
  /** Optional pre-filled city (e.g. from session). */
  initialCity?: string;
  /** Layout variant. */
  variant?: 'card' | 'inline';
};

const labelByStatus: Record<Status, string> = {
  idle: 'Use my location',
  requesting: 'Finding you\u2026',
  success: 'Location set',
  denied: 'Permission denied \u2014 type your city instead',
  error: 'Couldn\u2019t get location \u2014 type your city instead',
};

export function LocationButton({ onResolved, initialCity, variant = 'card' }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function requestLocation() {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('error');
      setErrMsg('Your browser doesn\u2019t support location');
      return;
    }
    setStatus('requesting');
    setErrMsg(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          if (!res.ok) throw new Error('geocode failed');
          const data = await res.json();
          const city =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            data.countryName ||
            initialCity ||
            '';
          const region = data.principalSubdivision;
          const country = data.countryName;
          const countryCode = data.countryCode;
          if (!city) throw new Error('no city found');
          onResolved({ city, region, country, countryCode, latitude, longitude });
          setStatus('success');
        } catch (e: any) {
          setStatus('error');
          setErrMsg(e?.message ?? 'Couldn\u2019t determine your city');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
          setErrMsg(err.message);
        }
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={requestLocation}
        disabled={status === 'requesting'}
        className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600 dark:text-coral-400 hover:underline disabled:opacity-50"
      >
        <Icon name="mapPin" size={15} />
        {status === 'requesting' ? 'Finding you\u2026' : initialCity ? `Use ${initialCity}` : 'Use my location'}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-coral-300 dark:border-coral-400/30 bg-coral-50/40 dark:bg-coral-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-coral-500 text-white shadow-soft">
          <Icon name="mapPin" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900 dark:text-ink-50">
            We need your location
          </p>
          <p className="text-sm text-ink-600 dark:text-ink-300 mt-0.5">
            Your browser will ask for permission. We use your location only to find
            nearby activities. We never store your exact coordinates.
          </p>
          <button
            type="button"
            onClick={requestLocation}
            disabled={status === 'requesting'}
            className="mt-3 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 shadow-soft active:scale-95 transition disabled:opacity-50"
          >
            <Icon name={status === 'requesting' ? 'sunBright' : 'mapPin'} size={16} className={status === 'requesting' ? 'animate-spin' : ''} />
            {labelByStatus[status]}
          </button>
          {errMsg && (
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">{errMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}