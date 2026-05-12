export default function AboutPage() {
  return (
    <main style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "100px 24px 120px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#3D4A2D",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          THEBRANDCRATE
        </p>

        <div
          style={{
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.8,
            color: "#3D4A2D",
          }}
        >
          <p style={{ marginBottom: "28px" }}>
            TheBrandCrate was founded in Norway with a simple but powerful belief — that clothing is more than fabric. It&apos;s a canvas. A way to express who you are, what you stand for, and where you&apos;re going.
          </p>
          <p style={{ marginBottom: "28px" }}>
            We started as a small collective of creatives who were tired of settling for the ordinary. Every piece we create is driven by the idea that style and substance can coexist — that what you wear can carry meaning without sacrificing quality.
          </p>
          <p>
            From Oslo to the rest of the world, we&apos;re building a brand that celebrates individuality, creativity, and the courage to stand out. TheBrandCrate isn&apos;t just a label. It&apos;s a mindset.
          </p>
        </div>
      </div>
    </main>
  );
}
