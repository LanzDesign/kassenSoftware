import React, { useState, useEffect } from "react";
import "./App.css";
import { Kassenabrechnung } from "./types";
import { kassenService, KassenEinstellungen, authService } from "./api";
import Login from "./Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );
  const [kasse, setKasse] = useState<Kassenabrechnung | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [einstellungen, setEinstellungen] =
    useState<KassenEinstellungen | null>(null);
  const [letzteKosten, setLetzteKosten] = useState<number>(0);
  const [showNeueAbrechnungModal, setShowNeueAbrechnungModal] = useState(false);
  const [neuerKassenstand, setNeuerKassenstand] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      initializeApp();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    if (window.confirm("Möchten Sie sich wirklich abmelden?")) {
      await authService.logout();
      setIsAuthenticated(false);
      setKasse(null);
      setEinstellungen(null);
    }
  };

  const initializeApp = async () => {
    try {
      // Initialize CSRF token first
      await kassenService.initCSRF();
      // Then load data
      await Promise.all([loadKasse(), loadEinstellungen()]);
    } catch (err) {
      console.error("Fehler beim Initialisieren:", err);
    }
  };

  const loadEinstellungen = async () => {
    try {
      const data = await kassenService.getEinstellungen();
      setEinstellungen(data);
    } catch (err) {
      console.error("Fehler beim Laden der Einstellungen:", err);
    }
  };

  // Konvertiert Strings zu Numbers für sichere Berechnungen
  const normalizeKasse = (data: any): Kassenabrechnung => {
    return {
      ...data,
      kassenstand_anfang: Number(data.kassenstand_anfang) || 0,
      anzahl_kinder: Number(data.anzahl_kinder) || 0,
      anzahl_erwachsene: Number(data.anzahl_erwachsene) || 0,
      anzahl_tee: Number(data.anzahl_tee) || 0,
      gesamt_kinder: Number(data.gesamt_kinder) || 0,
      gesamt_erwachsene: Number(data.gesamt_erwachsene) || 0,
      gesamt_tee: Number(data.gesamt_tee) || 0,
      gesamt_bargeld: Number(data.gesamt_bargeld) || 0,
      preis_kinder: Number(data.preis_kinder) || 0,
      preis_erwachsene: Number(data.preis_erwachsene) || 0,
      preis_tee: Number(data.preis_tee) || 0,
      rueckgeldspende: Number(data.rueckgeldspende) || 0,
      anzahl_50euro: Number(data.anzahl_50euro) || 0,
      anzahl_20euro: Number(data.anzahl_20euro) || 0,
      anzahl_10euro: Number(data.anzahl_10euro) || 0,
      anzahl_5euro: Number(data.anzahl_5euro) || 0,
      anzahl_2euro: Number(data.anzahl_2euro) || 0,
      anzahl_1euro: Number(data.anzahl_1euro) || 0,
      anzahl_50cent: Number(data.anzahl_50cent) || 0,
      anzahl_20cent: Number(data.anzahl_20cent) || 0,
      anzahl_10cent: Number(data.anzahl_10cent) || 0,
      gegeben: Number(data.gegeben) || 0,
      rueckgeld: Number(data.rueckgeld) || 0,
      tageseinnahmen_gesamt: Number(data.tageseinnahmen_gesamt) || 0,
      kassenstand_soll: Number(data.kassenstand_soll) || 0,
      bargeld_gesamt: Number(data.bargeld_gesamt) || 0,
    };
  };

  const loadKasse = async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const data = await kassenService.getAktuelle();
        setKasse(normalizeKasse(data));
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Keine Kassenabrechnung vorhanden, erstelle neue mit aktuellen Einstellungen
          const settings = await kassenService.getEinstellungen();
          const heute = new Date().toISOString().split("T")[0];
          const neueKasse = await kassenService.create({
            datum: heute,
            kassenstand_anfang: parseFloat(settings.kassenstand_anfang_default),
            anzahl_kinder: 0,
            anzahl_erwachsene: 0,
            anzahl_tee: 0,
            preis_kinder: parseFloat(settings.preis_position1),
            preis_erwachsene: parseFloat(settings.preis_position2),
            preis_tee: parseFloat(settings.preis_position3),
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
          setKasse(normalizeKasse(neueKasse));
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
      setKasse(normalizeKasse(updated));
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern");
    }
  };

  const incrementCounter = (
    field: keyof Kassenabrechnung,
    increment: number
  ) => {
    if (!kasse) return;
    const currentValue = Number(kasse[field]) || 0;
    const newValue = Math.max(0, currentValue + increment);
    updateKasse({ [field]: newValue });
  };

  const setCounter = (
    field: keyof Kassenabrechnung,
    value: number
  ) => {
    if (!kasse) return;
    updateKasse({ [field]: value });
  };

  const handleReset = async () => {
    if (!kasse || !kasse.id) return;
    if (window.confirm("Möchten Sie wirklich alle Zähler zurücksetzen?")) {
      try {
        const reset = await kassenService.reset(kasse.id);
        setKasse(normalizeKasse(reset));
      } catch (err: any) {
        setError(err.message || "Fehler beim Zurücksetzen");
      }
    }
  };

  const handleZahlungAbschliessen = () => {
    if (!kasse) return;
    // Berechne aktuelle Gesamtsumme der aktuellen Transaktion
    const aktuelleGesamtsumme =
      kasse.anzahl_kinder * kasse.preis_kinder +
      kasse.anzahl_erwachsene * kasse.preis_erwachsene +
      kasse.anzahl_tee * kasse.preis_tee;

    // Berechne aktuelles Bargeld
    const aktuellesBargeld =
      kasse.anzahl_50euro * 50 +
      kasse.anzahl_20euro * 20 +
      kasse.anzahl_10euro * 10 +
      kasse.anzahl_5euro * 5 +
      kasse.anzahl_2euro * 2 +
      kasse.anzahl_1euro * 1 +
      kasse.anzahl_50cent * 0.5 +
      kasse.anzahl_20cent * 0.2 +
      kasse.anzahl_10cent * 0.1;

    const rueckgeld = aktuellesBargeld - aktuelleGesamtsumme;
    if (rueckgeld < 0) {
      alert("Gegebenes Bargeld ist zu niedrig!");
      return;
    }

    // Speichere Kosten für Popup-Anzeige (vor dem Reset)
    setLetzteKosten(aktuelleGesamtsumme);

    // Addiere aktuelle Verkäufe zu Tagesgesamtsummen
    const neueGesamtKinder =
      (kasse.gesamt_kinder || 0) + (kasse.anzahl_kinder || 0);
    const neueGesamtErwachsene =
      (kasse.gesamt_erwachsene || 0) + (kasse.anzahl_erwachsene || 0);
    const neueGesamtTee = (kasse.gesamt_tee || 0) + (kasse.anzahl_tee || 0);
    const neuesGesamtBargeld = (kasse.gesamt_bargeld || 0) + aktuellesBargeld;

    // Zahlung speichern, aktuelle Zähler zurücksetzen, Gesamtsummen aktualisieren
    updateKasse({
      gegeben: aktuellesBargeld,
      rueckgeld,
      gesamt_kinder: neueGesamtKinder,
      gesamt_erwachsene: neueGesamtErwachsene,
      gesamt_tee: neueGesamtTee,
      gesamt_bargeld: neuesGesamtBargeld,
      anzahl_kinder: 0,
      anzahl_erwachsene: 0,
      anzahl_tee: 0,
      anzahl_50euro: 0,
      anzahl_20euro: 0,
      anzahl_10euro: 0,
      anzahl_5euro: 0,
      anzahl_2euro: 0,
      anzahl_1euro: 0,
      anzahl_50cent: 0,
      anzahl_20cent: 0,
      anzahl_10cent: 0,
    });
    setShowResult(true);
  };

  const handleRueckgeldspende = async () => {
    if (!kasse || !kasse.id) return;
    const rueckgeld = kasse.rueckgeld || 0;
    if (rueckgeld <= 0) {
      alert("Kein Rückgeld zum Spenden vorhanden!");
      return;
    }
    if (
      window.confirm(
        `Rückgeld von ${rueckgeld.toFixed(2)}€ als Spende verbuchen?`
      )
    ) {
      const neueSpende = (kasse.rueckgeldspende || 0) + rueckgeld;
      await updateKasse({
        rueckgeldspende: neueSpende,
        rueckgeld: 0,
        gegeben: 0,
      });
      alert(`Vielen Dank für die Spende von ${rueckgeld.toFixed(2)}€!`);
    }
  };

  const handleNeueAbrechnung = () => {
    if (!einstellungen) return;
    setNeuerKassenstand(einstellungen.kassenstand_anfang_default);
    setShowNeueAbrechnungModal(true);
  };

  const handleNeueAbrechnungErstellen = async () => {
    if (!einstellungen) return;
    const kassenstandWert = parseFloat(neuerKassenstand);
    if (isNaN(kassenstandWert) || kassenstandWert < 0) {
      alert("Bitte geben Sie einen gültigen Kassenwert ein!");
      return;
    }

    try {
      const heute = new Date().toISOString().split("T")[0];
      const neueKasse = await kassenService.create({
        datum: heute,
        kassenstand_anfang: kassenstandWert,
        anzahl_kinder: 0,
        anzahl_erwachsene: 0,
        anzahl_tee: 0,
        preis_kinder: parseFloat(einstellungen.preis_position1),
        preis_erwachsene: parseFloat(einstellungen.preis_position2),
        preis_tee: parseFloat(einstellungen.preis_position3),
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
      });
      setKasse(normalizeKasse(neueKasse));
      setShowNeueAbrechnungModal(false);
      alert("Neue Abrechnung erfolgreich erstellt!");
    } catch (err: any) {
      alert("Fehler beim Erstellen der neuen Abrechnung: " + err.message);
    }
  };

  const handlePreiseAktualisieren = async () => {
    if (!kasse || !kasse.id) return;
    if (
      window.confirm(
        "Preise aus den Einstellungen übernehmen? Dies aktualisiert die Preise für diese Abrechnung."
      )
    ) {
      try {
        const aktualisiert = await kassenService.aktualisiere_preise(kasse.id);
        setKasse(normalizeKasse(aktualisiert));
        alert("Preise erfolgreich aktualisiert!");
      } catch (err: any) {
        alert("Fehler beim Aktualisieren der Preise: " + err.message);
      }
    }
  };

  const handleBerichtTeilen = () => {
    if (!kasse) return;
    const bericht = `
═══════════════════════════════════════
SONNTAGSKÜCHE - FECG LAHR
KASSENABRECHNUNG
═══════════════════════════════════════

Datum: ${new Date(kasse.datum).toLocaleDateString("de-DE")}

───────────────────────────────────────
VERKÄUFE
───────────────────────────────────────
Kinder:      ${kasse.anzahl_kinder} x ${kasse.preis_kinder.toFixed(2)}€ = ${(
      kasse.anzahl_kinder * kasse.preis_kinder
    ).toFixed(2)}€
Erwachsene:  ${kasse.anzahl_erwachsene} x ${kasse.preis_erwachsene.toFixed(
      2
    )}€ = ${(kasse.anzahl_erwachsene * kasse.preis_erwachsene).toFixed(2)}€
Tee:         ${kasse.anzahl_tee} x ${kasse.preis_tee.toFixed(2)}€ = ${(
      kasse.anzahl_tee * kasse.preis_tee
    ).toFixed(2)}€

───────────────────────────────────────
KASSE
───────────────────────────────────────
Kassenstand Anfang:    ${kasse.kassenstand_anfang.toFixed(2)}€
Tageseinnahmen:        ${(kasse.tageseinnahmen_gesamt || 0).toFixed(2)}€
Kassenstand Soll:      ${(kasse.kassenstand_soll || 0).toFixed(2)}€
Bargeld Gezählt:       ${(kasse.bargeld_gesamt || 0).toFixed(2)}€
Differenz:             ${(
      (kasse.bargeld_gesamt || 0) - (kasse.kassenstand_soll || 0)
    ).toFixed(2)}€

───────────────────────────────────────
BARGELD-ZÄHLUNG
───────────────────────────────────────
50€:   ${kasse.anzahl_50euro} x 50.00€ = ${(kasse.anzahl_50euro * 50).toFixed(
      2
    )}€
20€:   ${kasse.anzahl_20euro} x 20.00€ = ${(kasse.anzahl_20euro * 20).toFixed(
      2
    )}€
10€:   ${kasse.anzahl_10euro} x 10.00€ = ${(kasse.anzahl_10euro * 10).toFixed(
      2
    )}€
5€:    ${kasse.anzahl_5euro} x 5.00€ = ${(kasse.anzahl_5euro * 5).toFixed(2)}€
2€:    ${kasse.anzahl_2euro} x 2.00€ = ${(kasse.anzahl_2euro * 2).toFixed(2)}€
1€:    ${kasse.anzahl_1euro} x 1.00€ = ${(kasse.anzahl_1euro * 1).toFixed(2)}€
50¢:   ${kasse.anzahl_50cent} x 0.50€ = ${(kasse.anzahl_50cent * 0.5).toFixed(
      2
    )}€
20¢:   ${kasse.anzahl_20cent} x 0.20€ = ${(kasse.anzahl_20cent * 0.2).toFixed(
      2
    )}€
10¢:   ${kasse.anzahl_10cent} x 0.10€ = ${(kasse.anzahl_10cent * 0.1).toFixed(
      2
    )}€

───────────────────────────────────────
RÜCKGELDSPENDE
───────────────────────────────────────
Gespendetes Rückgeld:  ${(kasse.rueckgeldspende || 0).toFixed(2)}€

═══════════════════════════════════════
Erstellt: ${new Date().toLocaleString("de-DE")}
═══════════════════════════════════════
    `.trim();

    // Kopiere in Zwischenablage
    navigator.clipboard
      .writeText(bericht)
      .then(() => {
        alert(
          "Bericht wurde in die Zwischenablage kopiert!\n\nSie können ihn jetzt in eine E-Mail oder Dokument einfügen."
        );
      })
      .catch(() => {
        // Fallback: Zeige Bericht in Alert
        alert(bericht);
      });

    // Optional: Drucken
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kassenabrechnung ${new Date(kasse.datum).toLocaleDateString(
              "de-DE"
            )}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${bericht}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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

  // Aktuelle Gesamtsumme (nur für die laufende Transaktion)
  const aktuelleGesamtsumme =
    kasse.anzahl_kinder * kasse.preis_kinder +
    kasse.anzahl_erwachsene * kasse.preis_erwachsene +
    kasse.anzahl_tee * kasse.preis_tee;

  return (
    <div className="App">
      {/* Header */}
      <div className="header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Sonntagsküche - FECG-Lahr</h1>
            <p>Datum: {new Date(kasse.datum).toLocaleDateString("de-DE")}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "#e53e3e",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            🚪 Abmelden
          </button>
        </div>
      </div>

      {/* Top Section: Gesamtsumme, Gegeben, Rückgeld, Nächster Button */}
      <div className="top-section">
        <div className="summary-card">
          <h2>Gesamtsumme:</h2>
          <div className="value">{aktuelleGesamtsumme.toFixed(2)}€</div>
        </div>
        <div className="summary-card">
          <h2>Gegeben:</h2>
          <div className="value">{(kasse.gegeben || 0).toFixed(2)}€</div>
        </div>
        <div className="summary-card">
          <h2>Rückgeld:</h2>
          <div className="value">{(kasse.rueckgeld || 0).toFixed(2)}€</div>
        </div>
        <button className="next-button" onClick={handleZahlungAbschliessen}>
          =&gt; nächster
        </button>
      </div>

      <div className="sales-section">
        <div className="sales-grid">
          <div className="sales-item kinder">
            <div className="counter-display">{kasse.anzahl_kinder} x</div>
            <h3>Kinder</h3>
            <div className="sales-emoji">👶</div>
            <div className="counter-buttons">
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_kinder", 3)}
              >
                3
              </button>
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_kinder", 4)}
              >
                4
              </button>
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_kinder", 5)}
              >
                5
              </button>
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_kinder", 6)}
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
          </div>

          <div className="sales-item erwachsen">
            <div className="counter-display">{kasse.anzahl_erwachsene} x</div>
            <h3>Erwach</h3>
            <div className="sales-emoji">👨</div>
            <div className="counter-buttons">
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_erwachsene", 3)}
              >
                3
              </button>
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_erwachsene", 4)}
              >
                4
              </button>
              <button
                className="counter-button"
                onClick={() => setCounter("anzahl_erwachsene", 5)}
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
          </div>

          <div className="sales-item tee">
            <div className="counter-display">{kasse.anzahl_tee} x</div>
            <div className="sales-emoji">☕</div>
            <div className="counter-buttons">
              <button
                className="counter-button tee-button"
                onClick={() => incrementCounter("anzahl_tee", 1)}
              >
                Tee
              </button>
              <button
                className="counter-button minus"
                onClick={() => incrementCounter("anzahl_tee", -1)}
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gegeben und Rückgeld Anzeige */}
      <div className="payment-display">
        <div className="payment-item">
          <span>Gegeben:</span>
          <span className="payment-value">{(kasse.gegeben || 0).toFixed(2)}€</span>
        </div>
        <div className="payment-item rueckgeld">
          <span>Rückgeld:</span>
          <span className="payment-value">{(kasse.rueckgeld || 0).toFixed(2)}€</span>
        </div>
      </div>

      {/* Zahlungs-Ergebnis Popup */}
      {showResult && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "15px",
              minWidth: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#2c5282",
              }}
            >
              💰 Zahlung
            </h2>
            <div style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
              <strong>Kosten:</strong>{" "}
              <span style={{ float: "right" }}>{letzteKosten.toFixed(2)}€</span>
            </div>
            <div style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
              <strong>Gegeben:</strong>{" "}
              <span style={{ float: "right" }}>
                {(kasse.gegeben || 0).toFixed(2)}€
              </span>
            </div>
            <hr style={{ margin: "15px 0" }} />
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#48bb78",
              }}
            >
              <strong>Rückgeld:</strong>{" "}
              <span style={{ float: "right" }}>
                {(kasse.rueckgeld || 0).toFixed(2)}€
              </span>
            </div>
            <div style={{ marginTop: "25px", display: "flex", gap: "10px" }}>
              {kasse.rueckgeld > 0 && (
                <button
                  onClick={() => {
                    handleRueckgeldspende();
                    setShowResult(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#f6ad55",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ❤️ Als Spende
                </button>
              )}
              <button
                onClick={() => setShowResult(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#2c5282",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ✓ OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bargeld-Zählung */}
      <div className="money-section">
        <div className="money-grid">
          {[
            {
              field: "anzahl_50euro",
              label: "50€",
              value: 50,
              img: "50euro.png",
            },
            {
              field: "anzahl_20euro",
              label: "20€",
              value: 20,
              img: "20euro.png",
            },
            {
              field: "anzahl_10euro",
              label: "10€",
              value: 10,
              img: "10euro.png",
            },
            { field: "anzahl_5euro", label: "5€", value: 5, img: "5euro.png" },
            { field: "anzahl_2euro", label: "2€", value: 2, img: "2euro.png" },
            { field: "anzahl_1euro", label: "1€", value: 1, img: "1euro.png" },
            {
              field: "anzahl_50cent",
              label: "50¢",
              value: 0.5,
              img: "50cent.png",
            },
            {
              field: "anzahl_20cent",
              label: "20¢",
              value: 0.2,
              img: "20cent.png",
            },
            {
              field: "anzahl_10cent",
              label: "10¢",
              value: 0.1,
              img: "10cent.png",
            },
          ].map((item) => (
            <div key={item.field} className="money-item">
              <div className="count">
                {kasse[item.field as keyof Kassenabrechnung]} x
              </div>
              <img
                src={`/images/money/${item.img}`}
                alt={item.label}
                onClick={() =>
                  incrementCounter(item.field as keyof Kassenabrechnung, 1)
                }
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextEl = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextEl) nextEl.style.display = "block";
                }}
                style={{
                  width: "100%",
                  height: "60px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              />
              <div className="label" style={{ display: "none" }}>
                {item.label}
              </div>
              <div
                style={{
                  marginTop: "3px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                {(
                  (kasse[item.field as keyof Kassenabrechnung] as number) *
                  item.value
                ).toFixed(2)}
                €
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Zusammenfassung und Buttons */}
      <div className="bottom-section">
        <div className="summary-info">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <strong>Gesamt:</strong>
              <br />
              {kasse.gesamt_kinder || 0} x Kaffee
              <br />
              {kasse.gesamt_erwachsene || 0} x Erwachsene
              <br />
              {kasse.gesamt_tee || 0} x Kinder
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>letzte Verkauf:</strong>
              <br />
              {kasse.anzahl_kinder || 0} x Kaffee
              <br />
              {kasse.anzahl_erwachsene || 0} x Erwachsene
              <br />
              {kasse.anzahl_tee || 0} x Kinder
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button reset" onClick={handleReset}>
            <div style={{ fontSize: "2.5rem", marginBottom: "5px" }}>🔄</div>
            <div>Reset</div>
          </button>
          <button
            className="action-button save"
            onClick={handleRueckgeldspende}
            style={{ background: "#2c5282" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "5px" }}>💰</div>
            <div>Rückgeldspende</div>
          </button>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#2d3748",
          padding: "10px",
          background: "white",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        Datum: {new Date(kasse.datum).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </div>

      {/* Modal für Neue Abrechnung */}
      {showNeueAbrechnungModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNeueAbrechnungModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "15px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: "#2d3748",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Neue Abrechnung erstellen
            </h2>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#2d3748",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  fontSize: "1rem",
                }}
              >
                Startwert der Kasse (€):
              </label>
              <input
                type="number"
                step="0.01"
                value={neuerKassenstand}
                onChange={(e) => setNeuerKassenstand(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "1.2rem",
                  border: "2px solid #cbd5e0",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowNeueAbrechnungModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e53e3e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleNeueAbrechnungErstellen}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
