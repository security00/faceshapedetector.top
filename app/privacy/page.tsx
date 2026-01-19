"use client";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1022] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,120,255,0.25),_transparent_50%),radial-gradient(circle_at_20%_40%,_rgba(236,72,153,0.18),_transparent_50%),radial-gradient(circle_at_80%_30%,_rgba(56,189,248,0.2),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-hex-pattern" />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20 pt-16">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Privacy</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Privacy Policy</h1>
          <p className="mt-4 text-sm text-white/70">
            Last updated: January 19, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm text-white/75">
            <section>
              <h2 className="text-base font-semibold text-white">1. Overview</h2>
              <p className="mt-2">
                We respect your privacy. This site is designed to process images locally in your
                browser by default, so your photos are not uploaded to our servers during on-device
                analysis.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">2. Data We Collect</h2>
              <p className="mt-2">
                We do not collect or store your uploaded photos when using on-device analysis. If
                you choose to connect a cloud API in the future, photos may be temporarily processed
                by that provider for analysis and handled according to their privacy terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">3. Cookies & Analytics</h2>
              <p className="mt-2">
                We do not use tracking cookies by default. If analytics are enabled later, we will
                update this policy and provide an opt-in mechanism where required.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">4. Security</h2>
              <p className="mt-2">
                We follow standard security practices and aim to minimize data collection. For any
                third-party services we integrate, we will review their security posture.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white">5. Contact</h2>
              <p className="mt-2">
                For privacy questions, please contact us at{" "}
                <span className="font-semibold text-white">support@faceshapedetector.top</span>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
