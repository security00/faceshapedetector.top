"use client";

import Image from "next/image";
import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

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
    { shape: "Rectangle", score: 0.22 },
    { shape: "Diamond", score: 0.19 },
  ],
  tips: [
    "Soft layers and side-swept bangs enhance balanced proportions.",
    "Try medium-length styles with volume around the cheeks.",
    "Round or oval glasses typically complement this shape.",
  ],
  demo: true,
};

const shapeTips: Record<string, string[]> = {
  Oval: [
    "Soft layers and side-swept bangs enhance balanced proportions.",
    "Try medium-length styles with volume around the cheeks.",
    "Round or oval glasses typically complement this shape.",
  ],
  Round: [
    "Go for styles with height on top to elongate the face.",
    "Side parts and angled layers add definition.",
    "Frames with sharp lines help balance softer contours.",
  ],
  Square: [
    "Soft, layered cuts reduce sharp jaw angles.",
    "Textured fringes can add softness around the forehead.",
    "Rounded frames balance strong lines.",
  ],
  Heart: [
    "Chin-length bobs and side-swept bangs add balance.",
    "Avoid too much volume at the crown.",
    "Oval frames work well with a wider forehead.",
  ],
  Diamond: [
    "Chin-length styles widen the jawline area.",
    "Side-swept bangs reduce cheekbone width emphasis.",
    "Rimless or oval frames soften the cheekbones.",
  ],
  Rectangle: [
    "Add width with waves or curls to balance a longer face.",
    "Avoid very long, straight styles with no layers.",
    "Square or bold frames can add structure.",
  ],
};

const features = [
  {
    title: "Instant Analysis",
    description: "Get results in seconds using on-device AI with no cloud latency.",
    icon: "⚡",
  },
  {
    title: "Personalized Insights",
    description: "Understand your face shape and receive tailored styling recommendations.",
    icon: "✨",
  },
  {
    title: "Secure & Private",
    description: "Your photos stay on your device and are never uploaded.",
    icon: "🔒",
  },
];

const steps = [
  {
    title: "Upload a photo",
    description: "Choose a clear, front-facing photo in JPG/PNG format.",
  },
  {
    title: "Analyze instantly",
    description: "Our AI measures key facial proportions and structure.",
  },
  {
    title: "Get your results",
    description: "View your face shape with confidence scores and tips.",
  },
];

const pricing = [
  {
    title: "Starter",
    price: "$0",
    detail: "On-device analysis with local processing.",
  },
  {
    title: "Pro",
    price: "Custom",
    detail: "Optional cloud analysis when HiFace API is connected.",
  },
  {
    title: "Enterprise",
    price: "Let’s talk",
    detail: "SLA, custom limits, and dedicated support.",
  },
];

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<FaceShapeResult>(demoResult);
  const [source, setSource] = useState<"demo" | "local">("demo");
  const [error, setError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const landmarkerPromiseRef = useRef<Promise<FaceLandmarker> | null>(null);

  useEffect(() => {
    if (!previewUrl) return;
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      landmarkerPromiseRef.current = null;
    };
  }, []);

  const loadLandmarker = async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    if (!landmarkerPromiseRef.current) {
      landmarkerPromiseRef.current = (async () => {
        const vision = await import("@mediapipe/tasks-vision");
        const filesetResolver = await vision.FilesetResolver.forVisionTasks("/mediapipe");
        const create = (delegate: "GPU" | "CPU") =>
          vision.FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "/mediapipe/face_landmarker.task",
              delegate,
            },
            runningMode: "IMAGE",
            numFaces: 1,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });
        const landmarker = await create("GPU").catch(() => create("CPU"));
        landmarkerRef.current = landmarker;
        return landmarker;
      })();
    }
    return landmarkerPromiseRef.current;
  };

  const distance = (a: NormalizedLandmark, b: NormalizedLandmark) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

  const scoreInRange = (value: number, min: number, max: number, falloff: number) => {
    if (value < min) return clamp01(1 - (min - value) / falloff);
    if (value > max) return clamp01(1 - (value - max) / falloff);
    return 1;
  };

  const deriveFaceShape = (landmarks: NormalizedLandmark[]): FaceShapeResult | null => {
    const pick = (index: number) => landmarks[index];
    const top = pick(10);
    const chin = pick(152);
    const foreheadL = pick(127);
    const foreheadR = pick(356);
    const cheekL = pick(234);
    const cheekR = pick(454);
    const jawL = pick(172);
    const jawR = pick(397);

    if (!top || !chin || !foreheadL || !foreheadR || !cheekL || !cheekR || !jawL || !jawR) {
      return null;
    }

    const faceLength = distance(top, chin);
    const foreheadWidth = distance(foreheadL, foreheadR);
    const cheekWidth = distance(cheekL, cheekR);
    const jawWidth = distance(jawL, jawR);

    if (!faceLength || !foreheadWidth || !cheekWidth || !jawWidth) return null;

    const lengthToCheek = faceLength / cheekWidth;
    const foreheadToJaw = foreheadWidth / jawWidth;
    const cheekToJaw = cheekWidth / jawWidth;
    const jawToCheek = jawWidth / cheekWidth;
    const foreheadToCheek = foreheadWidth / cheekWidth;
    const cheekToForehead = cheekWidth / foreheadWidth;
    const widthSpread = Math.max(foreheadWidth, cheekWidth, jawWidth) /
      Math.min(foreheadWidth, cheekWidth, jawWidth);

    const rawScores = [
      {
        shape: "Round",
        score:
          scoreInRange(lengthToCheek, 0.95, 1.2, 0.2) *
          scoreInRange(widthSpread, 1.0, 1.12, 0.12) *
          scoreInRange(jawToCheek, 0.9, 1.05, 0.15),
      },
      {
        shape: "Square",
        score:
          scoreInRange(lengthToCheek, 1.1, 1.3, 0.2) *
          scoreInRange(widthSpread, 1.0, 1.1, 0.12) *
          scoreInRange(foreheadToJaw, 0.95, 1.05, 0.12),
      },
      {
        shape: "Rectangle",
        score:
          scoreInRange(lengthToCheek, 1.5, 1.85, 0.25) *
          scoreInRange(widthSpread, 1.0, 1.12, 0.12) *
          scoreInRange(jawToCheek, 0.9, 1.05, 0.15) *
          scoreInRange(foreheadToJaw, 0.95, 1.05, 0.12),
      },
      {
        shape: "Oval",
        score:
          scoreInRange(lengthToCheek, 1.3, 1.6, 0.25) *
          scoreInRange(jawToCheek, 0.8, 0.95, 0.15) *
          scoreInRange(foreheadToCheek, 0.85, 1.0, 0.15),
      },
      {
        shape: "Heart",
        score:
          scoreInRange(lengthToCheek, 1.2, 1.5, 0.25) *
          scoreInRange(foreheadToJaw, 1.08, 1.25, 0.18) *
          scoreInRange(jawToCheek, 0.75, 0.9, 0.15),
      },
      {
        shape: "Diamond",
        score:
          scoreInRange(lengthToCheek, 1.2, 1.5, 0.3) *
          scoreInRange(cheekToForehead, 1.05, 1.2, 0.18) *
          scoreInRange(cheekToJaw, 1.05, 1.25, 0.2),
      },
    ];

    const total = rawScores.reduce((sum, item) => sum + item.score, 0);
    if (total <= 0) return null;

    const normalized = rawScores.map((item) => ({
      shape: item.shape,
      score: clamp01(item.score / total),
    }));
    const best = normalized.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    );

    return {
      shape: best.shape,
      confidence: clamp01(best.score),
      scores: normalized,
      tips: shapeTips[best.shape] ?? demoResult.tips,
    };
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
    setModelError(null);
    event.target.value = "";
    void handleAnalyze(selected);
  };

  const handleAnalyze = async (selectedFile: File) => {
    setStatus("loading");
    setError(null);
    setModelError(null);

    try {
      const landmarker = await loadLandmarker();
      const imageBitmap = await createImageBitmap(selectedFile);
      const detection = landmarker.detect(imageBitmap);
      imageBitmap.close?.();

      const faces = detection.faceLandmarks ?? [];
      if (!faces.length) {
        setStatus("error");
        setError("No face detected. Try a clearer, front-facing photo.");
        setResult(demoResult);
        setSource("demo");
        return;
      }

      if (faces.length > 1) {
        setError("Multiple faces detected. Using the most prominent face.");
      }

      const derived = deriveFaceShape(faces[0]);
      if (!derived) {
        setStatus("error");
        setError("Unable to compute face shape. Try a clearer photo.");
        setResult(demoResult);
        setSource("demo");
        return;
      }

      setResult(derived);
      setSource("local");
      setStatus("success");
    } catch {
      setStatus("error");
      setModelError(
        "Model failed to load. Ensure /public/mediapipe contains face_landmarker.task and vision_wasm files."
      );
      setError("Analysis failed. Showing demo results instead.");
      setResult(demoResult);
      setSource("demo");
    }
  };

  const sortedScores = [...result.scores].sort((a, b) => b.score - a.score);
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1022] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,120,255,0.25),_transparent_50%),radial-gradient(circle_at_20%_40%,_rgba(236,72,153,0.18),_transparent_50%),radial-gradient(circle_at_80%_30%,_rgba(56,189,248,0.2),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-hex-pattern" />

      <header className="relative z-10 pt-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/80 via-indigo-500/70 to-pink-500/70 shadow-lg shadow-cyan-500/20">
              <Image src="/logo.png" alt="Face Shape Detector" width={26} height={26} />
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Face Shape Detector
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a className="transition hover:text-white" href="#home">
              Home
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How It Works
            </a>
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#pricing">
              Pricing
            </a>
          </nav>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm text-white/80 transition hover:text-white"
            aria-label="Account"
            type="button"
          >
            👤
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section
          id="home"
          className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-16 text-center"
        >
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI Face Shape Detector
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Discover your unique facial structure instantly with our advanced AI technology. Upload a
              photo and see your face shape with confidence scores and personalized tips.
            </p>
          </div>

          <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-r from-cyan-500/25 via-indigo-500/20 to-pink-500/25 blur-2xl" />
                <div className="relative h-56 w-56 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Uploaded face"
                      fill
                      sizes="224px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/60">
                      <div className="h-20 w-20 rounded-full border border-white/20 bg-white/10" />
                      <span className="text-xs tracking-[0.2em] uppercase">Scanning...</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0">
                    <span className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-cyan-300" />
                    <span className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-pink-300" />
                    <span className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-blue-300" />
                    <span className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-indigo-300" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelect}
                />
                <button
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25 transition hover:scale-[1.02]"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  ⬆️ Upload Photo
                </button>
              </div>

              <div className="flex flex-col items-center gap-2 text-xs text-white/60">
                <span>Supported formats: JPG, PNG, WEBP · Max 5MB</span>
                {status === "loading" ? <span className="text-cyan-200">Analyzing...</span> : null}
                {error ? <span className="text-rose-300">{error}</span> : null}
                {modelError ? <span className="text-amber-200">{modelError}</span> : null}
              </div>
            </div>
          </div>

          <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Face Shape</p>
                  <h2 className="text-2xl font-semibold text-white">{result.shape}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Confidence</p>
                  <p className="text-2xl font-semibold text-white">{confidencePercent}%</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {sortedScores.map((score) => (
                  <div key={score.shape} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{score.shape}</span>
                      <span>{Math.round(score.score * 100)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400"
                        style={{ width: `${Math.min(score.score * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {source === "local" ? "On-device analysis" : "Demo data"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {status === "loading" ? "Analyzing" : "Instant results"}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Personalized tips</p>
              <ul className="mt-4 space-y-4 text-sm text-white/70">
                {result.tips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-1 text-pink-400">●</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                Analysis runs locally in your browser and photos never leave your device. HiFace API
                can be connected later for cloud validation.
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur">
            <div className="flex flex-col gap-8 text-center md:flex-row md:text-left">
              <div className="md:w-1/3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">How it works</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Three steps to your face shape</h2>
                <p className="mt-4 text-sm text-white/70">
                  Designed for fast, accurate analysis with a smooth user experience.
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-6">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm text-white/70">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Features</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Why people choose us</h2>
            <p className="mt-3 text-sm text-white/70">
              Fast, private, and designed to give you actionable insights.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pricing</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Plans for every stage</h2>
              <p className="mt-3 text-sm text-white/70">
                Start with demo data, then connect HiFace when you’re ready for production.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {pricing.map((plan) => (
                <div
                  key={plan.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
                >
                  <h4 className="text-lg font-semibold text-white">{plan.title}</h4>
                  <p className="mt-2 text-3xl font-semibold text-white">{plan.price}</p>
                  <p className="mt-3 text-sm text-white/70">{plan.detail}</p>
                  <button
                    type="button"
                    className="mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-white/80 transition hover:border-white/30"
                  >
                    Get started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="guide" className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Guide</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Face Shape Detector Guide</h2>
              <p className="mt-3 text-sm text-white/70">
                Learn what face shapes mean, how to get the most accurate results, and why a face
                shape detector can help you choose styles with confidence.
              </p>
            </div>

            <div className="mt-10 grid gap-8 text-sm text-white/75 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">What is a face shape?</h3>
                  <p className="mt-2">
                    Face shape describes the overall balance between your forehead, cheekbones, and
                    jawline. It is not about perfection or fixed categories; instead, it is a simple
                    way to summarize your natural proportions. A face shape detector looks at those
                    proportions and maps them into a familiar type such as oval, round, square,
                    heart, diamond, or rectangle. These labels are helpful shortcuts for picking
                    flattering hairstyles, glasses, makeup placement, and even beard shaping.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">How our face shape detector works</h3>
                  <p className="mt-2">
                    The experience is designed to be fast and privacy-first. Your photo is analyzed
                    locally in the browser using landmarks from a lightweight computer-vision model.
                    The detector measures distances such as face length, cheekbone width, and jaw
                    width. It then compares the ratios to known ranges for each face type. This is
                    why lighting, camera angle, and a neutral expression matter—good inputs help the
                    model produce stable, repeatable measurements.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">How to take the best photo</h3>
                  <p className="mt-2">
                    For the most accurate face shape detector results, use a front-facing photo with
                    even lighting and no heavy shadows. Keep your head straight, eyes level, and hair
                    tucked behind the ears if possible. Avoid wide-angle distortion by stepping back
                    slightly and letting the camera zoom in. Remove glasses and hats so the forehead
                    and jawline are visible. A neutral expression helps the landmark model lock onto
                    your features without bias from a smile or squint.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Face shapes explained</h3>
                  <p className="mt-2">
                    Oval faces are slightly longer than they are wide and tend to have balanced
                    proportions. Round faces are similar in length and width with softer angles.
                    Square faces have a strong jawline and similar widths across forehead, cheeks,
                    and jaw. Heart faces feature a wider forehead and a narrower chin. Diamond faces
                    have prominent cheekbones with a narrower forehead and jaw. Rectangle faces are
                    longer with more uniform widths and a straighter jawline. Your face shape
                    detector result summarizes these characteristics, but individual variation is
                    always normal.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">Styling ideas by face type</h3>
                  <p className="mt-2">
                    If your face shape detector reports round, styles with height and angles can add
                    length. For square faces, softer layers and side parts reduce sharpness. Heart
                    shapes often look great with chin-length bobs and side-swept fringe. Oval faces
                    suit most styles and can experiment freely. Diamond shapes benefit from volume at
                    the jawline or temples to balance cheekbones. Rectangle faces look best with
                    texture and width on the sides to break up length.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">Privacy and accuracy</h3>
                  <p className="mt-2">
                    This face shape detector runs on-device by default, so your images do not leave
                    your browser. Results are informational and can vary based on lighting or camera
                    angle, so feel free to try multiple photos for consistency. If you later enable
                    a cloud API, the provider may process the image temporarily for analysis. We will
                    always aim to keep the experience transparent, fast, and respectful of your data.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-6 text-sm text-white/75">
              <div>
                <h3 className="text-base font-semibold text-white">Frequently asked questions</h3>
                <p className="mt-2">
                  <span className="font-semibold text-white">Is this face shape detector accurate?</span>{" "}
                  It is designed to be consistent for clear, front-facing photos. For best results,
                  try a few images and compare the confidence scores across types.
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-white">Why do I get different results?</span>{" "}
                  Changes in lighting, camera distance, and head tilt can alter proportions. Keeping
                  a neutral pose improves stability.
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-white">Can I use this on mobile?</span>{" "}
                  Yes. The face shape detector runs inside your browser and works on modern mobile
                  devices, though older phones may load the model more slowly.
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-white">Do you store my photos?</span>{" "}
                  No. On-device analysis does not upload images. If a cloud integration is enabled
                  later, processing rules will be clearly disclosed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 text-sm text-white/70 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-white">Face Shape Detector</span>
            <span>
              Contact:{" "}
              <a className="text-white hover:text-cyan-200" href="mailto:support@faceshapedetector.top">
                support@faceshapedetector.top
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a className="hover:text-white" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-white" href="/terms">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
