"use client";

import { useEffect, useState } from "react";

export default function TestGPCPage() {
  const [gpcStatus, setGpcStatus] = useState<boolean | null>(null);
  const [simulatedGPC, setSimulatedGPC] = useState(false);
  const [runtimeConfig, setRuntimeConfig] = useState<any>(null);

  useEffect(() => {
    // Check actual GPC status
    const hasGPC = (navigator as any).globalPrivacyControl === true;
    setGpcStatus(hasGPC);
  }, []);

  const testGPC = async (gpcValue: boolean) => {
    try {
      const response = await fetch(`/api/ucm/runtime?region=US&gpc=${gpcValue}`, {
        cache: "no-store",
      });
      const data = await response.json();
      setRuntimeConfig(data);
    } catch (error) {
      console.error("Failed to test GPC:", error);
    }
  };

  const handleSimulateGPC = (value: boolean) => {
    setSimulatedGPC(value);
    testGPC(value);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>GPC Detection Test Page</h1>
      
      <div style={{ 
        backgroundColor: gpcStatus ? "#e8f5e9" : "#fff3e0", 
        padding: "1.5rem", 
        borderRadius: "8px",
        marginBottom: "2rem",
        border: `2px solid ${gpcStatus ? "#4caf50" : "#ff9800"}`
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          {gpcStatus ? "🛡️ GPC Enabled" : "⚠️ GPC Not Detected"}
        </h2>
        <p style={{ margin: 0, fontSize: "1rem", color: "#666" }}>
          {gpcStatus 
            ? "Your browser is sending the Global Privacy Control signal. Advertising will be automatically disabled."
            : "Your browser is not sending the GPC signal. You can simulate it below for testing."}
        </p>
      </div>

      <div style={{ 
        backgroundColor: "#f5f5f5", 
        padding: "1.5rem", 
        borderRadius: "8px",
        marginBottom: "2rem"
      }}>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Simulate GPC Signal</h3>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Test how the consent system responds to GPC signals:
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => handleSimulateGPC(false)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: simulatedGPC === false ? "#0066cc" : "#fff",
              color: simulatedGPC === false ? "#fff" : "#333",
              border: "1px solid #0066cc",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            GPC Off
          </button>
          <button
            onClick={() => handleSimulateGPC(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: simulatedGPC === true ? "#4caf50" : "#fff",
              color: simulatedGPC === true ? "#fff" : "#333",
              border: "1px solid #4caf50",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            GPC On
          </button>
        </div>
      </div>

      {runtimeConfig && (
        <div style={{ 
          backgroundColor: "#fff", 
          padding: "1.5rem", 
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Runtime Configuration</h3>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong>Framework:</strong> {runtimeConfig.framework}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Google Consent Mode Flags:</strong>
            <div style={{ 
              backgroundColor: "#f9f9f9", 
              padding: "1rem", 
              borderRadius: "4px",
              marginTop: "0.5rem",
              fontFamily: "monospace"
            }}>
              <div>ad_user_data: <span style={{ 
                color: runtimeConfig.gcm.ad_user_data === "granted" ? "#4caf50" : "#f44336",
                fontWeight: "bold"
              }}>{runtimeConfig.gcm.ad_user_data}</span></div>
              <div>ad_personalization: <span style={{ 
                color: runtimeConfig.gcm.ad_personalization === "granted" ? "#4caf50" : "#f44336",
                fontWeight: "bold"
              }}>{runtimeConfig.gcm.ad_personalization}</span></div>
              <div>analytics_storage: <span style={{ 
                color: runtimeConfig.gcm.analytics_storage === "granted" ? "#4caf50" : "#f44336",
                fontWeight: "bold"
              }}>{runtimeConfig.gcm.analytics_storage}</span></div>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Allowed Vendors:</strong>
            <div style={{ marginTop: "0.5rem" }}>
              {runtimeConfig.allowedVendors.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                  {runtimeConfig.allowedVendors.map((id: string) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#666", margin: 0 }}>No vendors allowed (GPC active)</p>
              )}
            </div>
          </div>

          <div>
            <strong>Available Purposes:</strong>
            <div style={{ marginTop: "0.5rem" }}>
              {runtimeConfig.ui.purposes.map((purpose: any) => (
                <div key={purpose.key} style={{ 
                  padding: "0.5rem", 
                  backgroundColor: purpose.default ? "#e8f5e9" : "#f5f5f5",
                  marginBottom: "0.5rem",
                  borderRadius: "4px"
                }}>
                  <strong>{purpose.label}</strong> - {purpose.description}
                  {purpose.default && <span style={{ 
                    marginLeft: "0.5rem",
                    color: "#4caf50",
                    fontSize: "0.9rem"
                  }}>✓ Default</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f0f7ff", borderRadius: "4px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>How to Enable GPC in Your Browser:</h3>
        <ul style={{ color: "#666", lineHeight: "1.8" }}>
          <li><strong>Chrome/Edge:</strong> Install the "Global Privacy Control" extension</li>
          <li><strong>Firefox:</strong> Set <code>privacy.globalprivacycontrol.enabled</code> to true in about:config</li>
          <li><strong>Brave:</strong> Enable "Global Privacy Control" in Settings → Shields</li>
          <li><strong>DuckDuckGo:</strong> GPC is enabled by default</li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <a href="/product" style={{ 
          display: "inline-block",
          padding: "0.75rem 2rem",
          backgroundColor: "#0066cc",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          fontWeight: "500"
        }}>
          Go to Product Page (with Cookie Banner)
        </a>
      </div>
    </div>
  );
}
