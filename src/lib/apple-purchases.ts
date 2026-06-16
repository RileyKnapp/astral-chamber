import { Capacitor, registerPlugin } from "@capacitor/core";

export const LIFETIME_ACCESS_PRODUCT_ID = "lifetime_access";

export type PurchaseProduct = {
  id: string;
  displayName: string;
  description: string;
  displayPrice: string;
};

type PurchaseResult = {
  hasLifetimeAccess: boolean;
  productId?: string;
  cancelled?: boolean;
  pending?: boolean;
};

type ProductResult = {
  products: PurchaseProduct[];
  hasLifetimeAccess: boolean;
};

type EntitlementResult = {
  hasLifetimeAccess: boolean;
};

type ApplePurchasesPlugin = {
  getProducts(): Promise<ProductResult>;
  purchaseLifetimeAccess(): Promise<PurchaseResult>;
  restorePurchases(): Promise<EntitlementResult>;
  currentEntitlements(): Promise<EntitlementResult>;
};

const ApplePurchases = registerPlugin<ApplePurchasesPlugin>("ApplePurchases");

export function canUseApplePurchases() {
  return Capacitor.getPlatform() === "ios" && Capacitor.isPluginAvailable("ApplePurchases");
}

export async function loadLifetimeProduct() {
  if (!canUseApplePurchases()) return null;
  const result = await ApplePurchases.getProducts();
  return {
    product: result.products.find((product) => product.id === LIFETIME_ACCESS_PRODUCT_ID) ?? null,
    hasLifetimeAccess: result.hasLifetimeAccess,
  };
}

export async function purchaseLifetimeAccess() {
  if (!canUseApplePurchases()) {
    throw new Error("Apple in-app purchases are only available in the iOS app.");
  }
  return ApplePurchases.purchaseLifetimeAccess();
}

export async function restoreLifetimeAccess() {
  if (!canUseApplePurchases()) {
    throw new Error("Restore purchases is only available in the iOS app.");
  }
  return ApplePurchases.restorePurchases();
}

export async function refreshLifetimeAccess() {
  if (!canUseApplePurchases()) return { hasLifetimeAccess: false };
  return ApplePurchases.currentEntitlements();
}
