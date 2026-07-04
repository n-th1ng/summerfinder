'use client';

import { useEffect, useState } from 'react';
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
  onResolved: (loc: ResolvedLocation) => void;
  initialCity?: string;
};

export function LocationButton({ onResolved, initialCity }: Props) {
  const [status, setStatus] = useState<Status>('requesting');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('error');
      setErrMsg('Your browser doesn\u2019t support location');
      return;
    }

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
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-100 dark:bg-coral-500/15 text-coral-500">
        <Icon
          name={status === 'requesting' ? 'sunBright' : status === 'success' ? 'check' : 'mapPin'}
          size={28}
          className={status === 'requesting' ? 'animate-spin' : ''}
        />
      </div>

      {status === 'requesting' && (
        <div className="text-center">
          <p className="font-semibold text-ink-900 dark:text-ink-50">Requesting location access\u2026</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Your browser is asking for permission.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Location found!</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            We&apos;ll use this to find activities near you.
          </p>
        </div>
      )}

      {status === 'denied' && (
        <div className="text-center">
          <p className="font-semibold text-ink-900 dark:text-ink-500">Permission denied</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            No worries — you can still take the quiz. We&apos;ll show activities from everywhere.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <p className="font-semibold text-ink-900 dark:text-ink-500">Couldn&apos;t get location</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {errMsg || 'Something went wrong.'} You can still take the quiz.
          </p>
        </div>
      )}
    </div>
  );
}
