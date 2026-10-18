"use client";

import { useEffect, useState } from "react";
import { webrtcSupported } from "@/engine/collab/session";
import type { UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import { icons } from "./icons";
import { Switch, subtle } from "./ui";

interface Props {
  wb: Whiteboard;
  ui: UIState;
  /** Invito arrivato da un link (`#collab=…`), da proporre per l'unione. */
  invite: string | null;
  onClose: () => void;
  notify: (text: string, kind?: "ok" | "error") => void;
}

const primary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";
const secondary =
  "flex items-center justify-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/10 disabled:pointer-events-none disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/15";
const field =
  "w-full rounded-xl bg-black/5 px-3 py-2 text-sm outline-none ring-indigo-500 placeholder:text-neutral-400 focus:ring-2 dark:bg-white/10";

async function copy(text: string, notify: Props["notify"], what: string) {
  try {
    await navigator.clipboard.writeText(text);
    notify(`${what} copiato negli appunti`);
  } catch {
    window.prompt(`Copia ${what.toLowerCase()}:`, text);
  }
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

export default function CollabDialog({ wb, ui, invite, onClose, notify }: Props) {
  const c = ui.collab;
  const [name, setName] = useState(c.name);
  const [joinText, setJoinText] = useState(invite ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [answerIn, setAnswerIn] = useState("");
  /** Il codice di risposta da mandare a chi ci ha invitato (ospite). */
  const [answerOut, setAnswerOut] = useState<string | null>(null);
  const supported = webrtcSupported();

  useEffect(() => {
    wb.setPaused(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      wb.setPaused(false);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quando qualcuno si collega, l'invito e la risposta pendenti hanno fatto il loro lavoro
  const peerCount = c.peers.length;
  useEffect(() => {
    if (peerCount > 0) {
      setInviteUrl(null);
      setAnswerIn("");
      setAnswerOut(null);
    }
  }, [peerCount]);

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  }

  function start() {
    const r = wb.startCollab(name);
    if (!r.ok) setError(r.error);
    else void makeInvite();
  }

  async function makeInvite() {
    const r = await run(() => wb.createInvite());
    if (!r) return;
    if (r.ok) setInviteUrl(r.url);
    else setError(r.error);
  }

  async function connect() {
    const r = await run(() => wb.acceptAnswer(answerIn));
    if (!r) return;
    if (r.ok) {
      setAnswerIn("");
      notify("Risposta accettata: collegamento in corso…");
    } else setError(r.error);
  }

  async function join() {
    wb.setCollabName(name);
    const r = await run(() => wb.joinCollab(joinText, name));
    if (!r) return;
    if (r.ok) {
      setAnswerOut(r.answer);
      setJoinText("");
    } else setError(r.error);
  }

  const you = (
    <li className="flex items-center gap-2 text-sm">
      <Dot color={c.color} />
      <span className="truncate font-medium">{c.name || "Ospite"}</span>
      <span className={`text-xs ${subtle}`}>(tu)</span>
    </li>
  );

  return (
    <div className="animate-fade-in fixed inset-0 z-40 grid place-items-center bg-black/30 p-3 backdrop-blur-sm" onPointerDown={onClose}>
      <div
        role="dialog"
        aria-label="Collaborazione in tempo reale"
        onPointerDown={(e) => e.stopPropagation()}
        className="animate-pop-in flex max-h-[92vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl bg-neutral-50 p-5 text-neutral-900 shadow-2xl dark:bg-neutral-900 dark:text-neutral-100"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Collabora in tempo reale</h2>
            <p className={`mt-0.5 text-xs ${subtle}`}>Peer-to-peer: i disegni passano direttamente tra i browser, senza server.</p>
          </div>
          <button type="button" aria-label="Chiudi" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 [&>svg]:h-4 [&>svg]:w-4">
            {icons.close}
          </button>
        </header>

        {!supported && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">Questo browser non supporta WebRTC.</p>}

        <label className="flex flex-col gap-1.5">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${subtle}`}>Il tuo nome</span>
          <input
            value={name}
            maxLength={24}
            placeholder="Ospite"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => wb.setCollabName(name)}
            className={field}
          />
        </label>

        {c.mode === "off" ? (
          <>
            <div className="flex flex-col gap-2">
              <button type="button" disabled={!supported || busy} onClick={start} className={primary}>
                <span className="[&>svg]:h-4 [&>svg]:w-4">{icons.users}</span>
                Collabora su questa lavagna
              </button>
              <p className={`text-xs ${subtle}`}>
                Crei un link d&apos;invito per ogni persona. La lavagna resta anche nel tuo browser e continua a funzionare offline.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="h-px flex-1 bg-current opacity-30" />
              oppure
              <span className="h-px flex-1 bg-current opacity-30" />
            </div>

            <div className="flex flex-col gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${subtle}`}>Unisciti a una lavagna</span>
              <textarea
                value={joinText}
                rows={3}
                placeholder="Incolla qui il link o il codice d'invito"
                onChange={(e) => setJoinText(e.target.value)}
                className={`${field} resize-none font-mono text-xs`}
              />
              <button type="button" disabled={!supported || busy || !joinText.trim() || !!answerOut} onClick={() => void join()} className={secondary}>
                Unisciti (crea una nuova lavagna)
              </button>
            </div>
          </>
        ) : (
          <>
            <section className="flex flex-col gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${subtle}`}>Partecipanti</span>
              <ul className="flex flex-col gap-1.5">
                {you}
                {c.peers.map((p) => (
                  <li key={p.site} className="flex items-center gap-2 text-sm">
                    <Dot color={p.color} />
                    <span className="truncate">{p.name}</span>
                  </li>
                ))}
              </ul>
              {c.peers.length === 0 && !answerOut && <p className={`text-xs ${subtle}`}>Nessuno collegato. Invita qualcuno qui sotto.</p>}
            </section>

            {answerOut && (
              <section className="flex flex-col gap-2 rounded-xl bg-indigo-500/10 p-3">
                <p className="text-sm font-medium">Ultimo passo: manda questo codice a chi ti ha invitato</p>
                <p className={`text-xs ${subtle}`}>Quando lo incolla nella sua finestra, il collegamento parte da solo.</p>
                <textarea readOnly rows={3} value={answerOut} onFocus={(e) => e.currentTarget.select()} className={`${field} resize-none font-mono text-xs`} />
                <button type="button" className={secondary} onClick={() => void copy(answerOut, notify, "Codice")}>
                  <span className="[&>svg]:h-4 [&>svg]:w-4">{icons.copy}</span>
                  Copia codice di risposta
                </button>
              </section>
            )}

            <section className="flex flex-col gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${subtle}`}>Invita una persona</span>
              {!inviteUrl ? (
                <button type="button" disabled={busy} onClick={() => void makeInvite()} className={secondary}>
                  <span className="[&>svg]:h-4 [&>svg]:w-4">{icons.link}</span>
                  {busy ? "Preparo l'invito…" : "Crea link d'invito"}
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <ol className={`list-decimal pl-4 text-xs ${subtle}`}>
                    <li>Manda il link alla persona.</li>
                    <li>Lei lo apre e ti rimanda un codice di risposta.</li>
                    <li>Incollalo qui sotto.</li>
                  </ol>
                  <button type="button" className={secondary} onClick={() => void copy(inviteUrl, notify, "Link")}>
                    <span className="[&>svg]:h-4 [&>svg]:w-4">{icons.copy}</span>
                    Copia link d&apos;invito
                  </button>
                  <textarea
                    value={answerIn}
                    rows={3}
                    placeholder="Incolla qui il codice di risposta"
                    onChange={(e) => setAnswerIn(e.target.value)}
                    className={`${field} resize-none font-mono text-xs`}
                  />
                  <button type="button" disabled={busy || !answerIn.trim()} onClick={() => void connect()} className={primary}>
                    Collega
                  </button>
                  <p className={`text-xs ${subtle}`}>Il link vale per una sola persona. Per un&apos;altra, creane uno nuovo.</p>
                </div>
              )}
            </section>

            {c.mode === "guest" && c.peers.length === 0 && !answerOut && (
              <section className="flex flex-col gap-2 rounded-xl bg-black/5 p-3 dark:bg-white/10">
                <span className="text-sm font-medium">Sessione sospesa</span>
                <p className={`text-xs ${subtle}`}>Per riconnetterti incolla un nuovo invito di qualcuno che è ancora nella stanza.</p>
                <textarea value={joinText} rows={2} placeholder="Link o codice d'invito" onChange={(e) => setJoinText(e.target.value)} className={`${field} resize-none font-mono text-xs`} />
                <button type="button" disabled={busy || !joinText.trim()} onClick={() => void join()} className={secondary}>
                  Riconnetti
                </button>
              </section>
            )}

            <button
              type="button"
              onClick={() => {
                wb.stopCollab();
                setInviteUrl(null);
                setAnswerOut(null);
                notify("Collaborazione terminata: la lavagna resta in questo browser");
              }}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              Esci dalla collaborazione
            </button>
          </>
        )}

        {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

        <details className={`text-xs ${subtle}`}>
          <summary className="cursor-pointer font-medium">Privacy e funzionamento</summary>
          <div className="mt-2 flex flex-col gap-2">
            <p>
              Non c&apos;è un server centrale: link e codici scambiano solo i dati di connessione e viaggiano dove li mandi tu. Chi ha il
              link e ti risponde diventa un partecipante a tutti gli effetti, e può modificare e cancellare. Condividilo solo con chi vuoi.
            </p>
            <p>Dopo il primo collegamento, chi entra si collega agli altri da solo. Il lavoro è salvato in ogni browser e si riunisce alla riconnessione.</p>
            <div className="rounded-xl bg-black/5 p-3 dark:bg-white/10">
              <Switch checked={c.stun} onChange={(v) => wb.setCollabStun(v)} label="Usa un server STUN pubblico" />
              <p className="mt-1.5">
                Serve per collegarsi attraverso reti diverse (casa, ufficio, mobile). Il server STUN vede il tuo indirizzo IP, mai i disegni.
                Disattivalo per collaborare solo nella stessa rete locale.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
