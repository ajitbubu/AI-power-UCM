
// Server component
import Link from "next/link";

async function getData(type?: string, limit?: number) {
  try {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (limit) params.set("limit", String(limit));
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/audit?${params.toString()}`, { cache: "no-store" });
    if (!r.ok) {
      console.error("Failed to fetch audit data:", r.status, r.statusText);
      return [];
    }
    return r.json();
  } catch (error) {
    console.error("Error fetching audit data:", error);
    return [];
  }
}

export default async function AuditPage({ searchParams }: { searchParams: { type?: string; limit?: string } }) {
  const type = searchParams?.type;
  const limit = Number(searchParams?.limit || 50);
  const data = await getData(type, limit);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>UCM‑AI Admin — Audit</h1>
      <p>Recent audit events from the backend (privacy headers, anomalies).</p>
      <div style={{ margin: "12px 0", display: "flex", gap: 12 }}>
        <Link href="/admin/audit">All</Link>
        <Link href="/admin/audit?type=privacy_headers">Privacy Headers</Link>
        <Link href="/admin/audit?type=anomaly">Anomalies</Link>
      </div>
      {data && data.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Time</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Type</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Site</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Cookie</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Vendor</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{row.occurredAt}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{row.type}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{row.site}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{row.cookieName ?? "-"}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{row.vendorId ?? "-"}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.details ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ padding: 24, textAlign: "center", color: "#666" }}>
          No audit data available. Audit events will appear here once privacy headers are logged or anomalies are detected.
        </p>
      )}
    </main>
  );
}
