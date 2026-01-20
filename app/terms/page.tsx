import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Face Shape Detector App",
  description:
    "Review the terms for using Face Shape Detector, including acceptable use, accuracy limits, intellectual property, and liability information.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1022] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,120,255,0.25),_transparent_50%),radial-gradient(circle_at_20%_40%,_rgba(236,72,153,0.18),_transparent_50%),radial-gradient(circle_at_80%_30%,_rgba(56,189,248,0.2),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-hex-pattern" />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20 pt-16">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Terms</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Terms of Service</h1>
          <p className="mt-4 text-sm text-white/70">
            Last updated: January 19, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm text-white/75">
            <section>
              <h2 className="text-base font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing or using this website, you agree to these Terms. If you do not agree,
                please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">2. Use of the Service</h2>
              <p className="mt-2">
                You may use the service for lawful purposes only. You are responsible for ensuring
                that any images you upload are permitted and do not violate third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">3. Accuracy</h2>
              <p className="mt-2">
                Face shape analysis is provided for informational purposes only. Results may vary
                based on lighting, angle, and image quality.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">4. Intellectual Property</h2>
              <p className="mt-2">
                All content and branding on this site are owned by Face Shape Detector unless
                otherwise stated.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">5. Limitation of Liability</h2>
              <p className="mt-2">
                We are not liable for any damages resulting from your use of the service. Use at
                your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">6. Contact</h2>
              <p className="mt-2">
                For questions about these terms, contact us at{" "}
                <span className="font-semibold text-white">support@faceshapedetector.top</span>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
