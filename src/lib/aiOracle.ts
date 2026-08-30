/**
 * AI Oracle attestation — signed signal bundle from ENRG-AI.
 *
 * Schema (published by `ENRG-AI/scripts/publish_signals.py`):
 *   { message: { generated_at, meta, signals: [...] }, signature, public_key }
 *
 * The landing renders a DEMO bundle immediately (never blank) and swaps to the
 * LIVE signed attestation as soon as it is reachable.
 */

import { LINKS, AI_ORACLE } from "../config";

export interface AISignal {
  kind: string;
  domain: string;
  ts: string;
  source: string;
  value: number;
  interval_low: number;
  interval_high: number;
  unit: string;
  meta: Record<string, unknown>;
}

export interface AIAttestationMessage {
  generated_at: string;
  meta: {
    source: string;
    requested_source?: string;
    bucket_minutes?: number;
    horizon_steps?: number;
    observed_generation_wh?: number;
    observed_buckets?: number;
    generation_unit?: string;
    market_unit?: string;
  };
  signals: AISignal[];
}

export interface AIAttestation {
  message: AIAttestationMessage;
  signature: string;
  public_key: string;
}

export type AIOracleStatus = "live" | "demo";

export interface AIOracleResult {
  status: AIOracleStatus;
  attestation: AIAttestation;
  sourceLabel: string;
  /** P1-3 (audit 2026-08-30): true only when the Ed25519 signature verified. */
  verified: boolean;
}

/** Demo attestation used while the published file is unreachable. */
function demoAttestation(): AIAttestation {
  const now = Date.now() / 1000;
  const hour = (ts: number) => new Date(ts * 1000).getUTCHours() + new Date(ts * 1000).getUTCMinutes() / 60;
  const solar = (ts: number) => {
    const h = hour(ts);
    return Math.max(0, Math.sin((Math.PI * (h - 6)) / 12)) * 6; // ~6 Wh/15min at noon
  };

  const steps = AI_ORACLE.demo.horizonSteps;
  const bucketMin = AI_ORACLE.demo.bucketMinutes;
  const forecast: AISignal[] = Array.from({ length: steps }, (_, i) => {
    const ts = (now + (i + 1) * bucketMin * 60);
    const value = solar(ts);
    const spread = 0.4 + i * 0.35;
    return {
      kind: "generation_forecast",
      domain: "pilot",
      ts: new Date(ts * 1000).toISOString().slice(0, 16),
      source: "demo",
      value,
      interval_low: Math.max(0, value - spread),
      interval_high: value + spread,
      unit: "Wh",
      meta: { bucket_minutes: bucketMin, step_ahead: i + 1 },
    };
  });

  const market: AISignal[] = [
    { kind: "market_forecast", domain: "market", ts: "", source: "demo", value: 0.126, interval_low: 0.115, interval_high: 0.137, unit: "usd_per_kwh", meta: { market_source: "dayahead" } },
    { kind: "market_forecast", domain: "market", ts: "", source: "demo", value: 0.106, interval_low: 0.096, interval_high: 0.116, unit: "usd_per_kwh", meta: { market_source: "p2p" } },
    { kind: "market_forecast", domain: "market", ts: "", source: "demo", value: 0.095, interval_low: 0.083, interval_high: 0.107, unit: "usd_per_kwh", meta: { market_source: "spot" } },
  ];

  return {
    message: {
      generated_at: new Date(now * 1000).toISOString(),
      meta: {
        source: "demo",
        requested_source: "demo",
        bucket_minutes: bucketMin,
        horizon_steps: steps,
        observed_generation_wh: AI_ORACLE.demo.observedWh,
        observed_buckets: 24,
        generation_unit: "Wh",
        market_unit: "usd_per_kwh",
      },
      signals: [...forecast, ...market],
    },
    signature: "",
    public_key: "",
  };
}

function parseAttestation(data: unknown): AIAttestation {
  const d = data as { message?: unknown; signature?: unknown; public_key?: unknown };
  const m = d?.message as AIAttestationMessage | undefined;
  if (!m || typeof m !== "object" || !Array.isArray(m.signals)) {
    throw new Error("bad attestation payload");
  }
  return {
    message: m,
    signature: typeof d.signature === "string" ? d.signature : "",
    public_key: typeof d.public_key === "string" ? d.public_key : "",
  };
}

// ════════════════════════════════════════════════════════════════
// P1-3 (audit 2026-08-30): REAL Ed25519 verification via WebCrypto.
// Previously the UI labeled attestations "Ed25519-verified" without checking.
// The signature covers canonical JSON of `message` (keys sorted, no
// whitespace, integer-valued floats normalized) — byte-compatible with
// ENRG-AI `agent/fed/protocol.py::canonical_json_bytes` (_normalize_numbers
// turns e.g. 12.0 into 12 before serialization).
// ════════════════════════════════════════════════════════════════
function canonicalize(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(canonicalize);
  if (obj !== null && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj as Record<string, unknown>).sort()) {
      out[k] = canonicalize((obj as Record<string, unknown>)[k]);
    }
    return out;
  }
  return obj;
}

function canonicalJsonBytes(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(canonicalize(obj)));
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyEd25519(
  message: Uint8Array,
  signatureB64: string,
  publicKeyB64: string,
): Promise<boolean> {
  try {
    const pk = base64ToBytes(publicKeyB64);
    const sig = base64ToBytes(signatureB64);
    if (pk.length !== 32 || sig.length !== 64) return false;
    // "Ed25519" is a modern WebCrypto algorithm; cast for older TS lib types.
    const algorithm = { name: "Ed25519" } as unknown as AlgorithmIdentifier;
    const key = await crypto.subtle.importKey(
      "raw",
      pk as unknown as BufferSource,
      algorithm,
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      algorithm,
      key,
      sig as unknown as BufferSource,
      message as unknown as BufferSource,
    );
  } catch {
    return false;
  }
}

export async function fetchAIAttestation(): Promise<AIOracleResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_ORACLE.timeoutMs);
  try {
    const res = await fetch(LINKS.aiAssessments, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    const attestation = parseAttestation(data);
    if (attestation.message.meta.source === "demo" && attestation.message.signals.every((s) => s.source === "demo")) {
      throw new Error("demo source in attestation");
    }

    // P1-3: an attestation may be rendered as "live" only if its signature
    // actually verifies. A present-but-invalid signature is a red flag, not a
    // badge — surface it honestly and fall back to the demo bundle.
    if (attestation.signature && attestation.public_key) {
      const ok = await verifyEd25519(
        canonicalJsonBytes(attestation.message),
        attestation.signature,
        attestation.public_key,
      );
      if (!ok) {
        console.warn("[aiOracle] Ed25519 signature verification FAILED — showing demo bundle");
        throw new Error("signature verification failed");
      }
      return {
        status: "live",
        attestation,
        sourceLabel: `LIVE · ${attestation.message.meta.source} · Ed25519-verified`,
        verified: true,
      };
    }

    // No signature at all: treat as unverified source.
    throw new Error("attestation has no signature");
  } catch {
    return {
      status: "demo",
      attestation: demoAttestation(),
      sourceLabel: "DEMO · projected AI signals",
      verified: false,
    };
  } finally {
    clearTimeout(timer);
  }
}
