"use client";

import { useEffect, useState } from "react";

interface ConsentChoice {
  vendorId: string;
  purpose: string;
  allowed: boolean;
}

interface RuntimeConfig {
  framework: string;
  gcm: {
    ad_user_data: string;
    ad_personalization: string;
    analytics_storage: string;
  };
  ui: {
    title: string;
    text: string;
    purposes: Array<{
      key: string;
      label: string;
      description: string;
      default: boolean;
    }>;
  };
  allowedVendors: string[];
}

interface CookieBannerProps {
  onConsentSaved: (consentId: string) => void;
}

export default function CookieBanner({ onConsentSaved }: CookieBannerProps) {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpcDetected, setGpcDetected] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [purposes, setPurposes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Detect GPC signal
    const hasGPC = (navigator as any).globalPrivacyControl === true;
    setGpcDetected(hasGPC);

    // Fetch runtime configuration
    fetchRuntimeConfig(hasGPC);
  }, []);

  const fetchRuntimeConfig = async (gpc: boolean) => {
    try {
      const region = getCookie("ucm_region") || "auto";
      const response = await fetch(
        `/api/ucm/runtime?region=${region}&gpc=${gpc}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      setConfig(data);

      // Initialize purposes with defaults
      const initialPurposes: Record<string, boolean> = {};
      data.ui.purposes.forEach((p: any) => {
        initialPurposes[p.key] = p.default;
      });
      setPurposes(initialPurposes);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch runtime config:", error);
      setLoading(false);
    }
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const handleAcceptAll = async () => {
    if (!config) return;

    const allPurposes: Record<string, boolean> = {};
    config.ui.purposes.forEach((p) => {
      allPurposes[p.key] = true;
    });

    await saveConsent(allPurposes);
  };

  const handleRejectAll = async () => {
    if (!config) return;

    const noPurposes: Record<string, boolean> = {};
    config.ui.purposes.forEach((p) => {
      // Keep necessary cookies
      noPurposes[p.key] = p.key === "necessary";
    });

    await saveConsent(noPurposes);
  };

  const handleSavePreferences = async () => {
    await saveConsent(purposes);
  };

  const saveConsent = async (selectedPurposes: Record<string, boolean>) => {
    if (!config) return;

    try {
      const choices: ConsentChoice[] = [];
      
      // Map purposes to vendor choices
      config.allowedVendors.forEach((vendorId) => {
        Object.entries(selectedPurposes).forEach(([purpose, allowed]) => {
          choices.push({ vendorId, purpose, allowed });
        });
      });

      const response = await fetch("/api/ucm/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: getCookie("ucm_region") || "US",
          gpc: gpcDetected,
          choices,
        }),
      });

      const data = await response.json();
      onConsentSaved(data.consentId);
    } catch (error) {
      console.error("Failed to save consent:", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.banner}>
          <p>Loading consent preferences...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.banner}>
        {/* GPC Badge */}
        {gpcDetected && (
          <div style={styles.gpcBadge}>
            <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>🛡️</span>
            <strong>GPC Detected:</strong> Your privacy preferences are being respected. 
            Advertising is automatically disabled.
          </div>
        )}

        {/* Header */}
        <h2 style={styles.title}>{config.ui.title}</h2>
        <p style={styles.text}>{config.ui.text}</p>

        {/* Framework Badge */}
        <div style={styles.frameworkBadge}>
          Framework: <strong>{config.framework}</strong>
        </div>

        {/* Purpose Toggles */}
        {showDetails && (
          <div style={styles.purposeList}>
            {config.ui.purposes.map((purpose) => (
              <div key={purpose.key} style={styles.purposeItem}>
                <div style={{ flex: 1 }}>
                  <div style={styles.purposeLabel}>
                    {purpose.label}
                    {purpose.key === "necessary" && (
                      <span style={styles.requiredBadge}>Required</span>
                    )}
                  </div>
                  <div style={styles.purposeDescription}>
                    {purpose.description}
                  </div>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={purposes[purpose.key] || false}
                    disabled={purpose.key === "necessary"}
                    onChange={(e) =>
                      setPurposes({
                        ...purposes,
                        [purpose.key]: e.target.checked,
                      })
                    }
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      ...styles.slider,
                      backgroundColor:
                        purposes[purpose.key] || purpose.key === "necessary"
                          ? "#0066cc"
                          : "#ccc",
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={styles.buttonSecondary}
          >
            {showDetails ? "Hide Details" : "Customize"}
          </button>
          <button onClick={handleRejectAll} style={styles.buttonSecondary}>
            Reject All
          </button>
          {showDetails ? (
            <button onClick={handleSavePreferences} style={styles.buttonPrimary}>
              Save Preferences
            </button>
          ) : (
            <button onClick={handleAcceptAll} style={styles.buttonPrimary}>
              Accept All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    padding: "1rem",
  },
  banner: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.2)",
  },
  gpcBadge: {
    backgroundColor: "#e8f5e9",
    border: "1px solid #4caf50",
    borderRadius: "4px",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    color: "#2e7d32",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
    color: "#333",
  },
  text: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "1rem",
    lineHeight: "1.5",
  },
  frameworkBadge: {
    display: "inline-block",
    backgroundColor: "#f0f0f0",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    color: "#666",
    marginBottom: "1rem",
  },
  purposeList: {
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
  },
  purposeItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    marginBottom: "0.75rem",
  },
  purposeLabel: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "0.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  purposeDescription: {
    fontSize: "0.875rem",
    color: "#666",
  },
  requiredBadge: {
    backgroundColor: "#ff9800",
    color: "#fff",
    padding: "0.125rem 0.5rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: "normal",
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "50px",
    height: "26px",
    cursor: "pointer",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "26px",
    transition: "0.3s",
  },
  buttonContainer: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
    flexWrap: "wrap",
  },
  buttonPrimary: {
    flex: 1,
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0066cc",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "600",
    minWidth: "120px",
  },
  buttonSecondary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "500",
  },
};
