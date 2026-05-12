"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const C = "#3D4A2D";

// ── Size configs ──────────────────────────────────────────────────────────────

const TSHIRT_SIZES = ["S", "M", "L", "XL"] as const;
const HOODIE_SIZES = ["XS", "S", "M", "L", "XL"] as const;

function tshirtBaseIndex(cm: number, gender: "men" | "women"): number {
  let idx = cm < 170 ? 0 : cm <= 178 ? 1 : cm <= 185 ? 2 : cm <= 192 ? 3 : 4;
  if (gender === "women") idx -= 1;
  return idx;
}

function hoodieBaseIndex(cm: number, gender: "men" | "women"): number {
  let idx = cm < 170 ? 0 : cm <= 178 ? 1 : cm <= 185 ? 2 : cm <= 192 ? 3 : 4;
  if (gender === "women") idx -= 1;
  return idx;
}

function calcSize(
  cm: number,
  gender: "men" | "women",
  build: "slim" | "average" | "broad",
  fit: "fitted" | "regular" | "oversized",
  productType: "tshirt" | "hoodie"
): string {
  const sizes = productType === "hoodie" ? HOODIE_SIZES : TSHIRT_SIZES;
  const baseIndex = productType === "hoodie" ? hoodieBaseIndex : tshirtBaseIndex;
  const buildAdj = build === "slim" ? -1 : build === "broad" ? 1 : 0;
  const fitAdj = fit === "fitted" ? -1 : fit === "oversized" ? 1 : 0;
  const idx = Math.min(sizes.length - 1, Math.max(0, baseIndex(cm, gender) + buildAdj + fitAdj));
  return sizes[idx];
}

function buildLabel(build: "slim" | "average" | "broad"): string {
  return build === "slim" ? "slim build" : build === "broad" ? "broad build" : "average build";
}
function fitLabel(fit: "fitted" | "regular" | "oversized"): string {
  return fit === "fitted" ? "a fitted" : fit === "oversized" ? "an oversized" : "a regular";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Dots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            backgroundColor: i <= step ? C : "transparent",
            border: `1.5px solid ${C}`,
            display: "inline-block",
            transition: "background-color 0.2s",
          }}
        />
      ))}
    </div>
  );
}

function Card({ label, sub, selected, onClick }: { label: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "16px 12px", textAlign: "center", cursor: "pointer",
        border: `${selected ? 2 : 1}px solid ${selected ? C : "#d0d0c8"}`,
        backgroundColor: selected ? "#f0f4ec" : "#fff",
        transition: "all 0.15s",
        fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: C, marginBottom: sub ? 4 : 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: C, opacity: 0.65, lineHeight: 1.4 }}>{sub}</p>}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSelectSize: (size: string) => void;
  productType?: "tshirt" | "hoodie";
}

export function FindYourSize({ onClose, onSelectSize, productType = "tshirt" }: Props) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<"men" | "women" | null>(null);
  const [unit, setUnit] = useState<"cm" | "ftin">("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [build, setBuild] = useState<"slim" | "average" | "broad" | null>(null);
  const [fit, setFit] = useState<"fitted" | "regular" | "oversized" | null>(null);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function getHeightCm(): number {
    if (unit === "cm") return parseFloat(heightCm);
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    return Math.round(ft * 30.48 + inch * 2.54);
  }

  function isHeightValid(): boolean {
    const cm = getHeightCm();
    return !isNaN(cm) && cm >= 100 && cm <= 250;
  }

  const canNext = [gender !== null, isHeightValid(), build !== null, fit !== null][step];

  function reset() {
    setStep(0); setGender(null); setHeightCm(""); setHeightFt(""); setHeightIn("");
    setBuild(null); setFit(null); setUnit("cm");
  }

  const showResult = step === 4;
  const cmVal = getHeightCm();
  const recommended = showResult ? calcSize(cmVal, gender!, build!, fit!, productType) : "M";
  const explanation = showResult
    ? `Based on your height of ${cmVal} cm and ${buildLabel(build!)}, ${recommended} gives you ${fitLabel(fit!)} fit.`
    : "";

  const stepLabel = ["Who are you shopping for?", "What is your height?", "How would you describe your build?", "How would you like the fit?"][step] ?? "";

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 480, backgroundColor: "#fff",
          padding: "32px 28px 28px",
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          animation: "fys-fade 0.2s ease",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, color: C, fontSize: 22, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}
          aria-label="Close"
        >
          ×
        </button>

        {showResult ? (
          <>
            <Dots step={3} />
            <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C, opacity: 0.55, marginBottom: 20 }}>
              Your recommendation
            </p>
            <p style={{ fontSize: 36, fontWeight: 700, color: C, marginBottom: 12, letterSpacing: "-0.01em" }}>
              Size {recommended}
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C, opacity: 0.75, marginBottom: 28 }}>
              {explanation}
            </p>
            <button
              onClick={() => { onSelectSize(recommended); onClose(); }}
              style={{
                width: "100%", padding: "14px", backgroundColor: C, color: "#fff",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
                border: "none", cursor: "pointer", marginBottom: 16,
              }}
            >
              Select {recommended}
            </button>
            <button
              onClick={reset}
              style={{ display: "block", width: "100%", textAlign: "center", fontSize: 12, color: C, opacity: 0.6, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Start over
            </button>
          </>
        ) : (
          <>
            <Dots step={step} />
            <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C, opacity: 0.55, marginBottom: 8 }}>
              Step {step + 1} of 4
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: C, marginBottom: 24 }}>
              {stepLabel}
            </p>

            {step === 0 && (
              <div className="flex gap-3">
                <Card label="Men" selected={gender === "men"} onClick={() => setGender("men")} />
                <Card label="Women" selected={gender === "women"} onClick={() => setGender("women")} />
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="flex mb-4" style={{ border: `1px solid ${C}`, display: "inline-flex" }}>
                  {(["cm", "ftin"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      style={{
                        padding: "6px 16px", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
                        cursor: "pointer", border: "none",
                        backgroundColor: unit === u ? C : "#fff",
                        color: unit === u ? "#fff" : C,
                        transition: "all 0.15s",
                      }}
                    >
                      {u === "cm" ? "cm" : "ft / in"}
                    </button>
                  ))}
                </div>
                {unit === "cm" ? (
                  <input
                    type="number" placeholder="180" value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: `1px solid #d0d0c8`, outline: "none", color: C, fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", boxSizing: "border-box" }}
                  />
                ) : (
                  <div className="flex gap-3">
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C, opacity: 0.55, display: "block", marginBottom: 4 }}>Feet</label>
                      <input type="number" placeholder="5" value={heightFt} onChange={(e) => setHeightFt(e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: `1px solid #d0d0c8`, outline: "none", color: C, fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C, opacity: 0.55, display: "block", marginBottom: 4 }}>Inches</label>
                      <input type="number" placeholder="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: `1px solid #d0d0c8`, outline: "none", color: C, fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", boxSizing: "border-box" }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex gap-3">
                <Card label="Slim" selected={build === "slim"} onClick={() => setBuild("slim")} />
                <Card label="Average" selected={build === "average"} onClick={() => setBuild("average")} />
                <Card label="Broad" selected={build === "broad"} onClick={() => setBuild("broad")} />
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Card label="Fitted" sub="Close to the body" selected={fit === "fitted"} onClick={() => setFit("fitted")} />
                <Card label="Regular" sub="Relaxed and comfortable" selected={fit === "regular"} onClick={() => setFit("regular")} />
                <Card label="Oversized" sub="Loose and roomy" selected={fit === "oversized"} onClick={() => setFit("oversized")} />
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => step === 0 ? onClose() : setStep(step - 1)}
                style={{ fontSize: 13, color: C, opacity: 0.65, background: "none", border: "none", cursor: "pointer" }}
              >
                {step === 0 ? "Cancel" : "← Back"}
              </button>
              <button
                onClick={() => { if (canNext) setStep(step + 1); }}
                disabled={!canNext}
                style={{
                  padding: "12px 28px", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", border: "none", cursor: canNext ? "pointer" : "default",
                  backgroundColor: canNext ? C : "#d0d0c8", color: "#fff",
                  transition: "background-color 0.2s",
                }}
              >
                {step === 3 ? "See my size" : "Next →"}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes fys-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
