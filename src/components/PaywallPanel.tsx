import { useEffect } from "react";
import { useAppState, type Intention } from "@/lib/app-state";

const OUTCOME_KEYS: Record<Intention, string> = {
  sleep: "paywall.outcome.sleep",
  meditate: "paywall.outcome.meditate",
  lucid: "paywall.outcome.lucid",
  astral: "paywall.outcome.astral",
};

const HIDDEN_PURCHASE_ERRORS = ["Lifetime access product is not available"];

export function PaywallPanel({
  intention,
  compact = false,
}: {
  intention?: Intention | null;
  compact?: boolean;
}) {
  const {
    purchaseProduct,
    purchaseStatus,
    purchaseError,
    loadPurchaseProduct,
    purchaseLifetime,
    restorePurchases,
    t,
  } = useAppState();
  const outcome = t(intention ? OUTCOME_KEYS[intention] : "paywall.outcome.default");
  const isPurchasing = purchaseStatus === "purchasing";
  const isRestoring = purchaseStatus === "restoring";
  const price = purchaseProduct?.displayPrice ?? "$7.99";
  const visiblePurchaseError =
    purchaseError &&
    !HIDDEN_PURCHASE_ERRORS.some((hiddenError) => purchaseError.includes(hiddenError));

  useEffect(() => {
    void loadPurchaseProduct();
  }, [loadPurchaseProduct]);

  return (
    <div
      className={`w-full max-w-md ${compact ? "" : "rounded-sm border border-[#c0b0f0]/35 bg-black/25 p-6"}`}
    >
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#c0b0f0]/50 bg-[#c0b0f0]/10 text-2xl text-[#d8ccff] shadow-[0_0_45px_rgba(192,176,240,0.2)]">
          ✦
        </div>
        <div className="mt-5 text-[9px] font-bold tracking-[0.38em] text-[#8ab8f0]">
          {t("paywall.kicker")}
        </div>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-white">
          {t("paywall.titlePrefix")}
          <br />
          <span className="text-[#c0b0f0]">{outcome}.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[11px] leading-relaxed text-[#cfe7ff]/70">
          {t("paywall.copy")}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          ["15+", t("paywall.metric.journeys")],
          ["∞", t("paywall.metric.sessions")],
          ["100%", t("paywall.metric.private")],
        ].map(([value, label]) => (
          <div key={label} className="rounded-sm border border-white/10 bg-white/[0.025] px-2 py-3">
            <div className="font-serif text-xl text-white">{value}</div>
            <div className="mt-1 text-[7px] tracking-[0.2em] text-[#8ab8f0]">{label}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={purchaseLifetime}
        disabled={isPurchasing || isRestoring}
        className="mt-6 w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[10px] font-bold tracking-[0.28em] text-[#080610] shadow-[0_0_35px_rgba(192,176,240,0.24)] transition hover:scale-[1.01]"
      >
        {isPurchasing ? t("paywall.openingStore") : `${t("paywall.unlock")} · ${price}`}
      </button>
      <p className="mt-2 text-center text-[8px] tracking-[0.12em] text-white/35">
        {t("paywall.purchaseNote")}
      </p>
      <button
        type="button"
        onClick={restorePurchases}
        disabled={isPurchasing || isRestoring}
        className="mt-4 w-full text-center text-[9px] tracking-[0.22em] text-[#8ab8f0]"
      >
        {isRestoring ? t("paywall.restoring") : t("paywall.restore")}
      </button>
      {visiblePurchaseError && (
        <p className="mt-3 text-center text-[9px] leading-relaxed text-[#e8a8d4]/80">
          {visiblePurchaseError}
        </p>
      )}
    </div>
  );
}
