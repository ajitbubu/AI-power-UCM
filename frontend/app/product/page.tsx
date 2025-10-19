"use client";

import { useEffect, useState } from "react";
import CookieBanner from "@/components/CookieBanner";

export default function ProductPage() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem("ucm_consent_id");
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsentSaved = (consentId: string) => {
    localStorage.setItem("ucm_consent_id", consentId);
    setShowBanner(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: "#fff", 
        padding: "1rem 2rem", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "2rem"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#333" }}>UCM Store</h1>
          <nav style={{ display: "flex", gap: "1.5rem" }}>
            <a href="/" style={{ color: "#666", textDecoration: "none" }}>Home</a>
            <a href="/product" style={{ color: "#0066cc", textDecoration: "none", fontWeight: "bold" }}>Products</a>
            <a href="/admin/audit" style={{ color: "#666", textDecoration: "none" }}>Admin</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#333" }}>Featured Products</h2>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "2rem",
          marginTop: "2rem"
        }}>
          {/* Product Cards */}
          {[
            { id: 1, name: "Premium Headphones", price: "$299", image: "🎧" },
            { id: 2, name: "Smart Watch", price: "$399", image: "⌚" },
            { id: 3, name: "Wireless Keyboard", price: "$149", image: "⌨️" },
            { id: 4, name: "4K Monitor", price: "$599", image: "🖥️" },
            { id: 5, name: "Gaming Mouse", price: "$79", image: "🖱️" },
            { id: 6, name: "USB-C Hub", price: "$49", image: "🔌" },
          ].map((product) => (
            <div
              key={product.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "1rem" }}>
                {product.image}
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "#333" }}>
                {product.name}
              </h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0066cc", marginBottom: "1rem" }}>
                {product.price}
              </p>
              <button
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#0066cc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0052a3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0066cc";
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Cookie Banner */}
      {showBanner && <CookieBanner onConsentSaved={handleConsentSaved} />}
    </div>
  );
}
