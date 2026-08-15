export default function CRMLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        padding: "34px 28px",
      }}
    >
      <div
        style={{
          width: "min(1050px, 100%)",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: 110,
            height: 10,
            borderRadius: 999,
            background: "#e5e8eb",
            marginBottom: 14,
          }}
        />

        <div
          style={{
            width: 240,
            height: 46,
            borderRadius: 12,
            background: "#e5e8eb",
            marginBottom: 12,
          }}
        />

        <div
          style={{
            width: 360,
            height: 14,
            borderRadius: 999,
            background: "#e9ecef",
            marginBottom: 30,
          }}
        />

        <div
          style={{
            height: 150,
            borderRadius: 27,
            background: "#e9ecef",
          }}
        />
      </div>
    </main>
  );
}
