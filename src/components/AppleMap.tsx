import { MapPin } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { type Salon } from '../data/salons';
import { getMapKitToken } from '../lib/mapkitApi';

const MAPKIT_SCRIPT_ID = 'apple-mapkit-js';
const MAPKIT_SCRIPT_SRC = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';

type AppleMapStatus = 'loading' | 'ready' | 'fallback';

interface MapKitAnnotation {
  addEventListener: (eventName: 'select', callback: () => void) => void;
}

interface MapKitMapInstance {
  annotations?: MapKitAnnotation[];
  removeAnnotations: (annotations: MapKitAnnotation[]) => void;
  showItems: (items: MapKitAnnotation[], options?: { animate?: boolean }) => void;
  destroy?: () => void;
}

interface MapKitGlobal {
  init: (options: { authorizationCallback: (done: (token: string) => void) => void; language?: string }) => void;
  Map: {
    new (element: HTMLElement, options: Record<string, unknown>): MapKitMapInstance;
    ColorSchemes: { Light: string };
  };
  Coordinate: new (lat: number, lng: number) => unknown;
  MarkerAnnotation: new (coordinate: unknown, options: Record<string, unknown>) => MapKitAnnotation;
  FeatureVisibility: { Adaptive: string };
}

interface AppleMapProps {
  salons: Salon[];
  className?: string;
  ariaLabel: string;
  onOpenSalon: (salon: Salon) => void;
  getFallbackPinStyle: (salon: Salon, salons: Salon[]) => CSSProperties;
}

declare global {
  interface Window {
    mapkit?: MapKitGlobal;
  }
}

function loadMapKitScript() {
  const existing = document.getElementById(MAPKIT_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      if (window.mapkit) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar MapKit JS.')), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = MAPKIT_SCRIPT_ID;
    script.src = MAPKIT_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('No se pudo cargar MapKit JS.')), { once: true });
    document.head.appendChild(script);
  });
}

export default function AppleMap({ salons, className = 'market-map', ariaLabel, onOpenSalon, getFallbackPinStyle }: AppleMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapKitMapInstance | null>(null);
  const [status, setStatus] = useState<AppleMapStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!containerRef.current || salons.length === 0) {
        setStatus('fallback');
        return;
      }

      try {
        await loadMapKitScript();
        const token = await getMapKitToken();
        const mapkit = window.mapkit;
        if (cancelled || !mapkit || !containerRef.current) return;

        mapkit.init({
          authorizationCallback(done: (token: string) => void) {
            done(token);
          },
          language: 'es',
        });

        const map = new mapkit.Map(containerRef.current, {
          colorScheme: mapkit.Map.ColorSchemes.Light,
          showsCompass: mapkit.FeatureVisibility.Adaptive,
          showsMapTypeControl: false,
        });

        const annotations = salons.map((salon) => {
          const annotation = new mapkit.MarkerAnnotation(
            new mapkit.Coordinate(salon.lat, salon.lng),
            {
              title: salon.name,
              subtitle: `${salon.location} · desde ${salon.desde} €`,
              color: '#4F46E5',
            },
          );
          annotation.addEventListener('select', () => onOpenSalon(salon));
          return annotation;
        });

        map.removeAnnotations(map.annotations || []);
        map.showItems(annotations, { animate: false });
        mapRef.current = map;
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    }

    setupMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy?.();
        mapRef.current = null;
      }
    };
  }, [getFallbackPinStyle, onOpenSalon, salons]);

  return (
    <div className={`${className} apple-map-shell ${status === 'ready' ? 'is-ready' : ''}`} aria-label={ariaLabel}>
      <div ref={containerRef} className="apple-map-canvas" aria-hidden={status !== 'ready'} />
      {status !== 'ready' && (
        <div className="apple-map-fallback" aria-hidden={status === 'loading' ? 'true' : undefined}>
          {salons.map((salon) => (
            <button
              key={salon.id}
              className="market-map-pin"
              style={getFallbackPinStyle(salon, salons)}
              type="button"
              onClick={() => onOpenSalon(salon)}
              aria-label={`Abrir ficha de ${salon.name}`}
            >
              <MapPin size={16} />
              <span>{salon.desde} €</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
