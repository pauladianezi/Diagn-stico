import { Diagnostic } from "./types";

const KEY = "grenah_diagnostics";
export const CHANGE_EVENT = "grenah:diagnostics";

export function loadDiagnostics(): Diagnostic[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persist(all: Diagnostic[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveDiagnostic(diag: Diagnostic) {
  const all = loadDiagnostics();
  const updated = { ...diag, atualizadoEm: new Date().toISOString() };
  const idx = all.findIndex((d) => d.id === diag.id);
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  persist(all);
}

export function deleteDiagnostic(id: string) {
  persist(loadDiagnostics().filter((d) => d.id !== id));
}

// Atualiza a lista quando algo muda nesta aba ou em outra aba do navegador
export function subscribeDiagnostics(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}
