import { idioma, idiomasDisponibles, setIdioma, type Idioma } from '../lib/tr';

const NOMBRES: Record<Idioma, string> = { es: 'Español', nb: 'Norsk', en: 'English' };
const CORTOS: Record<Idioma, string> = { es: 'ES', nb: 'NO', en: 'EN' };

/** «NO · EN» fuera de España; en España (un solo idioma) no se pinta. */
export default function SelectorIdioma() {
  const disponibles = idiomasDisponibles();
  if (disponibles.length < 2) return null;
  const actual = idioma();
  return (
    <div className="selector-idioma" role="group" aria-label="Språk / Language" style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {disponibles.map((l) => (
        <button
          key={l}
          type="button"
          title={NOMBRES[l]}
          aria-pressed={l === actual}
          onClick={() => l !== actual && setIdioma(l)}
          className="btn btn-ghost"
          style={{ padding: '4px 8px', fontWeight: l === actual ? 700 : 400, opacity: l === actual ? 1 : 0.65, minHeight: 0 }}
        >
          {CORTOS[l]}
        </button>
      ))}
    </div>
  );
}
