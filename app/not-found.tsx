import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f8f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          textAlign: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            position: "relative",
            textDecoration: "none",
            color: "#111",
            fontSize: "30px",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            marginBottom: "45px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-15px",
              right: "-12px",
              color: "#D4AF37",
              fontSize: "15px",
              lineHeight: 1,
            }}
          >
            ✦
          </span>
          metro<span style={{ color: "#29AB87" }}>vybe</span>
        </Link>

        <div
          style={{
            background: "#fff",
            border: "2px solid #111",
            borderRadius: "22px",
            padding: "42px 28px",
            boxShadow: "5px 6px 0 #111",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 950,
              lineHeight: 1,
              letterSpacing: "-4px",
              color: "#29AB87",
              marginBottom: "14px",
            }}
          >
            404
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "28px",
              fontWeight: 900,
              color: "#111",
            }}
          >
            Looks like you took a wrong vybe.
          </h1>

          <p
            style={{
              margin: "0 auto 26px",
              maxWidth: "380px",
              color: "#666",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            This page doesn&apos;t exist or may have moved somewhere else.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#29AB87",
              color: "#fff",
              border: "2px solid #111",
              borderRadius: "12px",
              padding: "12px 22px",
              textDecoration: "none",
              fontWeight: 900,
              boxShadow: "3px 4px 0 #111",
            }}
          >
            ← Back to MetroVybe
          </Link>
        </div>
      </div>
    </main>
  );
}
