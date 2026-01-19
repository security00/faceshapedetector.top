import { NextResponse } from "next/server";

type ShapeScore = {
  shape: string;
  score: number;
};

type FaceShapeResult = {
  shape: string;
  confidence: number;
  scores: ShapeScore[];
  tips: string[];
  demo?: boolean;
};

const demoResult: FaceShapeResult = {
  shape: "Oval",
  confidence: 0.92,
  scores: [
    { shape: "Oval", score: 0.92 },
    { shape: "Heart", score: 0.74 },
    { shape: "Round", score: 0.42 },
    { shape: "Square", score: 0.28 },
    { shape: "Diamond", score: 0.19 },
  ],
  tips: [
    "Soft layers and side-swept bangs enhance balanced proportions.",
    "Try medium-length styles with volume around the cheeks.",
    "Round or oval glasses typically complement this shape.",
  ],
  demo: true,
};

const defaultTips = demoResult.tips;

const pickShape = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const pickNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1 ? value / 100 : value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed > 1 ? parsed / 100 : parsed;
    }
  }
  return null;
};

const normalizeScores = (value: unknown): ShapeScore[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const shape = pickShape(
        (entry as { shape?: unknown }).shape ?? (entry as { label?: unknown }).label
      );
      const score = pickNumber(
        (entry as { score?: unknown }).score ?? (entry as { confidence?: unknown }).confidence
      );
      if (!shape || score === null) return null;
      return { shape, score };
    })
    .filter((item): item is ShapeScore => Boolean(item));
};

const normalizeResponse = (payload: unknown): FaceShapeResult | null => {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const nested = (data.result ?? data.data ?? data.output) as Record<string, unknown> | undefined;
  const shape =
    pickShape(data.face_shape) ||
    pickShape(data.faceShape) ||
    pickShape(data.shape) ||
    pickShape(nested?.face_shape) ||
    pickShape(nested?.faceShape) ||
    pickShape(nested?.shape);
  const confidence =
    pickNumber(data.confidence) ||
    pickNumber(data.score) ||
    pickNumber(nested?.confidence) ||
    pickNumber(nested?.score);
  const scores =
    normalizeScores(data.scores) ||
    normalizeScores(data.distribution) ||
    normalizeScores(nested?.scores) ||
    normalizeScores(nested?.distribution);
  const tips =
    (Array.isArray(data.tips) && data.tips.every((tip) => typeof tip === "string")
      ? (data.tips as string[])
      : null) ||
    (Array.isArray(nested?.tips) && (nested?.tips as unknown[]).every((tip) => typeof tip === "string")
      ? (nested?.tips as string[])
      : null) ||
    defaultTips;

  if (!shape || confidence === null) return null;

  return {
    shape,
    confidence,
    scores: scores.length ? scores : demoResult.scores,
    tips,
  };
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = (formData.get("file") ?? formData.get("image")) as File | null;

  if (!file) {
    return NextResponse.json(
      { ok: false, error: "No file provided", normalized: demoResult },
      { status: 400 }
    );
  }

  const baseUrl = process.env.HIFACE_BASE_URL;
  const apiKey = process.env.HIFACE_API_KEY;
  const uploadField = process.env.HIFACE_UPLOAD_FIELD ?? "file";

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ ok: true, source: "demo", normalized: demoResult });
  }

  const upstreamForm = new FormData();
  upstreamForm.append(uploadField, file, file.name || "upload.jpg");

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/detect-face-shape`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: upstreamForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { ok: false, source: "hiface", error: "Upstream error", details: errorText },
        { status: 502 }
      );
    }

    const data = (await response.json()) as unknown;
    const normalized = normalizeResponse(data) ?? demoResult;

    return NextResponse.json({ ok: true, source: "hiface", normalized, raw: data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, source: "hiface", error: "Failed to reach upstream", details: String(error) },
      { status: 502 }
    );
  }
}
