import React, { useState, useEffect } from "react";
import "./App.css";
import { Kassenabrechnung } from "./types";
import { kassenService } from "./api";

function App() {
  const [kasse, setKasse] = useState<Kassenabrechnung | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKasse();
  }, []);

  const loadKasse = async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const data = await kassenService.getAktuelle();
        setKasse(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Keine Kassenabrechnung vorhanden, erstelle neue
          const heute = new Date().toISOString().split("T")[0];
          const neueKasse = await kassenService.create({
            datum: heute,
            kassenstand_anfang: 0,
            anzahl_kinder: 0,
            anzahl_erwachsene: 0,
            anzahl_tee: 0,
            preis_kinder: 3.0,
            preis_erwachsene: 5.0,
            preis_tee: 1.0,
            rueckgeldspende: 0,
            anzahl_50euro: 0,
            anzahl_20euro: 0,
            anzahl_10euro: 0,
            anzahl_5euro: 0,
            anzahl_2euro: 0,
            anzahl_1euro: 0,
            anzahl_50cent: 0,
            anzahl_20cent: 0,
            anzahl_10cent: 0,
            gegeben: 0,
            rueckgeld: 0,
          });
          setKasse(neueKasse);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      setError(err.message || "Fehler beim Laden der Daten");
    } finally {
      setLoading(false);
    }
  };

  const updateKasse = async (updates: Partial<Kassenabrechnung>) => {
    if (!kasse || !kasse.id) return;
    try {
      const updated = await kassenService.update(kasse.id, updates);
      setKasse(updated);
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern");
    }
  };

  const incrementCounter = (
    field: keyof Kassenabrechnung,
    increment: number
  ) => {
    if (!kasse) return;
    const currentValue = kasse[field] as number;
    const newValue = Math.max(0, currentValue + increment);
    updateKasse({ [field]: newValue });
  };

  const handleReset = async () => {
    if (!kasse || !kasse.id) return;
    if (window.confirm("Möchten Sie wirklich alle Zähler zurücksetzen?")) {
      try {
        const reset = await kassenService.reset(kasse.id);
        setKasse(reset);
      } catch (err: any) {
        setError(err.message || "Fehler beim Zurücksetzen");
      }
    }
  };

  const handleShare = () => {
    if (!kasse) return;
    alert("Bericht wurde geteilt! (Funktionalität wird später implementiert)");
  };

  if (loading) {
    return <div className="loading">Lädt Kassensystem...</div>;
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <strong>Fehler:</strong> {error}
          <button onClick={loadKasse} style={{ marginLeft: "10px" }}>
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!kasse) {
    return <div className="loading">Keine Daten verfügbar</div>;
  }

  const gesamtsumme = kasse.tageseinnahmen_gesamt || 0;

  return (
    <div className="App">
      <div className="header">
        <h1>Sonntagsküche - FECG-Lahr</h1>
        <p>Datum: {new Date(kasse.datum).toLocaleDateString("de-DE")}</p>
      </div>

      <div className="summary-card">
        <div className="summary-grid">
          <div className="summary-item">
            <label>Kassenstand Anfang:</label>
            <div className="value highlight">
              {kasse.kassenstand_anfang.toFixed(2)}€
            </div>
          </div>
          <div className="summary-item">
            <label>Tageseinnahmen gesamt:</label>
            <div className="value">{gesamtsumme.toFixed(2)}€</div>
          </div>
        </div>
      </div>

      <div className="sales-section">
        <h2>Verkäufe</h2>
        <div className="sales-grid">
          <div className="sales-item kinder">
            <h3>👶 Kinder</h3>
            <div className="counter-display">{kasse.anzahl_kinder} x</div>
            <div className="counter-buttons">
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_kinder", 3)}
              >
                3
              </button>
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_kinder", 4)}
              >
                4
              </button>
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_kinder", 5)}
              >
                5
              </button>
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_kinder", 6)}
              >
                6
              </button>
              <button
                className="counter-button minus"
                onClick={() => incrementCounter("anzahl_kinder", -1)}
              >
                -
              </button>
            </div>
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              {(kasse.anzahl_kinder * kasse.preis_kinder).toFixed(2)}€
            </p>
          </div>

          <div className="sales-item erwachsen">
            <h3>👨 Erwachsen</h3>
            <div className="counter-display">{kasse.anzahl_erwachsene} x</div>
            <div className="counter-buttons">
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_erwachsene", 3)}
              >
                3
              </button>
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_erwachsene", 4)}
              >
                4
              </button>
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_erwachsene", 5)}
              >
                5
              </button>
              <button
                className="counter-button minus"
                onClick={() => incrementCounter("anzahl_erwachsene", -1)}
              >
                -
              </button>
            </div>
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              {(kasse.anzahl_erwachsene * kasse.preis_erwachsene).toFixed(2)}€
            </p>
          </div>

          <div className="sales-item tee">
            <h3>☕ Tee</h3>
            <div className="counter-display">{kasse.anzahl_tee} x</div>
            <div className="counter-buttons">
              <button
                className="counter-button"
                onClick={() => incrementCounter("anzahl_tee", 1)}
              >
                +
              </button>
              <button
                className="counter-button minus"
                onClick={() => incrementCounter("anzahl_tee", -1)}
              >
                -
              </button>
            </div>
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              {(kasse.anzahl_tee * kasse.preis_tee).toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <h2>Gesamtsumme</h2>
        <div
          className="value"
          style={{ fontSize: "3rem", textAlign: "center", color: "#2c5282" }}
        >
          {gesamtsumme.toFixed(2)}€
        </div>
        <button className="next-button" onClick={handleShare}>
          =&gt; nächster
        </button>
      </div>

      <div className="payment-section">
        <h2>Zahlung</h2>
        <div className="payment-grid">
          <div className="payment-item">
            <label>Gegeben:</label>
            <div className="value">{kasse.gegeben.toFixed(2)}€</div>
          </div>
          <div className="payment-item">
            <label>Rückgeld:</label>
            <div className="value">{kasse.rueckgeld.toFixed(2)}€</div>
          </div>
        </div>
      </div>

      <div className="money-section">
        <h2>Bargeld-Zählung</h2>
        <div className="money-grid">
          {[
            { field: "anzahl_50euro", label: "50€", value: 50 },
            { field: "anzahl_20euro", label: "20€", value: 20 },
            { field: "anzahl_10euro", label: "10€", value: 10 },
            { field: "anzahl_5euro", label: "5€", value: 5 },
            { field: "anzahl_2euro", label: "2€", value: 2 },
            { field: "anzahl_1euro", label: "1€", value: 1 },
            { field: "anzahl_50cent", label: "50¢", value: 0.5 },
            { field: "anzahl_20cent", label: "20¢", value: 0.2 },
            { field: "anzahl_10cent", label: "10¢", value: 0.1 },
          ].map((item) => (
            <div key={item.field} className="money-item">
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {item.label}
              </div>
              <div className="count">
                {kasse[item.field as keyof Kassenabrechnung]} x
              </div>
              <div className="money-buttons">
                <button
                  className="counter-button"
                  onClick={() =>
                    incrementCounter(item.field as keyof Kassenabrechnung, 1)
                  }
                >
                  +
                </button>
                <button
                  className="counter-button minus"
                  onClick={() =>
                    incrementCounter(item.field as keyof Kassenabrechnung, -1)
                  }
                >
                  -
                </button>
              </div>
              <p style={{ marginTop: "5px", fontWeight: "bold" }}>
                {(
                  (kasse[item.field as keyof Kassenabrechnung] as number) *
                  item.value
                ).toFixed(2)}
                €
              </p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>Gesamt: {(kasse.bargeld_gesamt || 0).toFixed(2)}€</h3>
          <p style={{ marginTop: "10px" }}>
            <strong>Kassenstand Soll:</strong>{" "}
            {(kasse.kassenstand_soll || 0).toFixed(2)}€
          </p>
        </div>
      </div>

      <div className="summary-card">
        <h3>Letzte Verkäufe</h3>
        <p>Gesamt: {kasse.anzahl_kinder} x Kaffee</p>
        <p>Gesamt: {kasse.anzahl_erwachsene} x Erwachsene</p>
        <p>Gesamt: {kasse.anzahl_tee} x Kinder</p>
      </div>

      <div className="action-buttons">
        <button className="action-button reset" onClick={handleReset}>
          🔄 Reset
        </button>
        <button className="action-button save" onClick={handleShare}>
          💾 Rückgeldspende
        </button>
      </div>
    </div>
  );
}

export default App;
