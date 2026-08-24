import type { BountyRadarOpportunity } from "./types";

/**
 * Normalizes a Bounty Radar base URL to its A2A JSON-RPC endpoint.
 * Accepts either `https://host` or `https://host/a2a`.
 */
export function normalizeBountyRadarUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/a2a")) {
    return trimmed;
  }
  return `${trimmed}/a2a`;
}

/** Extract text from A2A Message parts. */
function extractTextParts(message: any): string[] {
  if (!message || !Array.isArray(message.parts)) {
    return [];
  }
  return message.parts
    .filter((p: any) => p?.kind === "text" && typeof p.text === "string")
    .map((p: any) => p.text);
}

/** Extract structured data parts (kind === "data"). */
function extractDataParts(message: any): any[] {
  if (!message || !Array.isArray(message.parts)) {
    return [];
  }
  return message.parts
    .filter((p: any) => p?.kind === "data" && p.data != null)
    .map((p: any) => p.data);
}

/** Try to parse JSON embedded in text parts. Returns array of parsed values. */
function extractJsonFromText(texts: string[]): any[] {
  const out: any[] = [];
  for (const t of texts) {
    try {
      out.push(JSON.parse(t));
      continue;
    } catch {
      /* not pure JSON — look for embedded objects/arrays below */
    }
    const arrayMatches = t.match(/\[\s*\{[\s\S]*?\}\s*\]/g) || [];
    for (const m of arrayMatches) {
      try {
        out.push(JSON.parse(m));
      } catch {
        /* skip malformed */
      }
    }
    const objMatches = t.match(/\{[^{}]*agent_access[^{}]*\}/g) || [];
    for (const m of objMatches) {
      try {
        out.push(JSON.parse(m));
      } catch {
        /* skip malformed */
      }
    }
  }
  return out;
}

function isAgentAllowedShape(o: any): boolean {
  return (
    o &&
    typeof o === "object" &&
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    o.agent_access === "AGENT_ALLOWED"
  );
}

function normalizeOpp(o: any): BountyRadarOpportunity {
  return { ...o, agent_access: "AGENT_ALLOWED" };
}

function coerceOpportunities(data: any): BountyRadarOpportunity[] {
  if (Array.isArray(data)) {
    return data.filter(isAgentAllowedShape).map(normalizeOpp);
  }
  if (data && Array.isArray(data.opportunities)) {
    return data.opportunities.filter(isAgentAllowedShape).map(normalizeOpp);
  }
  if (isAgentAllowedShape(data)) {
    return [normalizeOpp(data)];
  }
  return [];
}

function dedupeById(opps: BountyRadarOpportunity[]): BountyRadarOpportunity[] {
  const seen = new Set<string>();
  return opps.filter((o) => {
    if (seen.has(o.id)) {
      return false;
    }
    seen.add(o.id);
    return true;
  });
}

/** Collect opportunity-shaped objects from Task artifacts or Message parts. */
export function extractOpportunities(
  resultBody: any,
): BountyRadarOpportunity[] {
  const opportunities: BountyRadarOpportunity[] = [];
  const result = resultBody?.result ?? resultBody;

  // Task with artifacts
  if (Array.isArray(result?.artifacts)) {
    for (const art of result.artifacts) {
      for (const p of art?.parts ?? []) {
        if (p?.kind === "data" && p.data != null) {
          opportunities.push(...coerceOpportunities(p.data));
        }
        if (p?.kind === "text" && typeof p.text === "string") {
          opportunities.push(
            ...coerceOpportunities(extractJsonFromText([p.text])),
          );
        }
      }
    }
  }

  // Message with direct parts (kind === "message" or bare parts array)
  const msg =
    result?.kind === "message"
      ? result
      : Array.isArray(result?.parts)
        ? result
        : (result?.status?.message ?? result?.message);
  if (msg && Array.isArray(msg.parts)) {
    for (const d of extractDataParts(msg)) {
      opportunities.push(...coerceOpportunities(d));
    }
    opportunities.push(
      ...coerceOpportunities(extractJsonFromText(extractTextParts(msg))),
    );
  }

  // Direct Message response (or task status message)
  if (result?.status?.message || result?.message) {
    const msg = result.status?.message ?? result.message;
    for (const d of extractDataParts(msg)) {
      opportunities.push(...coerceOpportunities(d));
    }
    opportunities.push(
      ...coerceOpportunities(extractJsonFromText(extractTextParts(msg))),
    );
  }

  return dedupeById(opportunities).filter(
    (o: BountyRadarOpportunity) => o.agent_access === "AGENT_ALLOWED",
  );
}

/** Fetch live AGENT_ALLOWED opportunities from a Bounty Radar A2A endpoint. */
export async function fetchBountyRadarFeed(
  bountyRadarUrl: string,
): Promise<BountyRadarOpportunity[]> {
  const endpoint = normalizeBountyRadarUrl(bountyRadarUrl);
  const requestId = `br-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const rpcBody = {
    jsonrpc: "2.0",
    id: requestId,
    method: "message/send",
    params: {
      message: {
        role: "user",
        messageId: requestId,
        parts: [{ kind: "text", text: "/feed" }],
        kind: "message",
      },
    },
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcBody),
    });
  } catch (err: any) {
    throw new Error(
      `Bounty Radar unreachable at ${endpoint}: ${err?.message ?? err}`,
    );
  }

  if (!response.ok) {
    throw new Error(`Bounty Radar HTTP ${response.status} at ${endpoint}`);
  }

  let body: any;
  try {
    body = await response.json();
  } catch {
    throw new Error("Bounty Radar returned invalid JSON");
  }

  if (body?.error) {
    throw new Error(
      `Bounty Radar JSON-RPC error ${body.error.code ?? "?"}: ${body.error.message ?? ""}`,
    );
  }

  return extractOpportunities(body);
}
