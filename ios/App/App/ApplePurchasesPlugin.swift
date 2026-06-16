import Capacitor
import StoreKit

@objc(ApplePurchasesPlugin)
public class ApplePurchasesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ApplePurchasesPlugin"
    public let jsName = "ApplePurchases"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchaseLifetimeAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "currentEntitlements", returnType: CAPPluginReturnPromise)
    ]

    private let lifetimeProductId = "lifetime_access"

    @objc public func getProducts(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: [lifetimeProductId])
                guard let product = products.first else {
                    await reject(call, "Lifetime access product is not available")
                    return
                }
                await resolve(call, [
                    "products": [productPayload(product)],
                    "hasLifetimeAccess": await hasLifetimeAccess()
                ])
            } catch {
                await reject(call, "Unable to load App Store products: \(error.localizedDescription)")
            }
        }
    }

    @objc public func purchaseLifetimeAccess(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: [lifetimeProductId])
                guard let product = products.first else {
                    await reject(call, "Lifetime access product is not available")
                    return
                }

                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    let transaction = try checkVerified(verification)
                    guard transaction.productID == lifetimeProductId else {
                        await reject(call, "Unexpected App Store product")
                        return
                    }
                    await transaction.finish()
                    await resolve(call, [
                        "hasLifetimeAccess": true,
                        "productId": transaction.productID
                    ])
                case .userCancelled:
                    await resolve(call, [
                        "hasLifetimeAccess": await hasLifetimeAccess(),
                        "cancelled": true
                    ])
                case .pending:
                    await resolve(call, [
                        "hasLifetimeAccess": await hasLifetimeAccess(),
                        "pending": true
                    ])
                @unknown default:
                    await reject(call, "Unknown App Store purchase result")
                }
            } catch {
                await reject(call, "Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    @objc public func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                await resolve(call, ["hasLifetimeAccess": await hasLifetimeAccess()])
            } catch {
                await reject(call, "Restore failed: \(error.localizedDescription)")
            }
        }
    }

    @objc public func currentEntitlements(_ call: CAPPluginCall) {
        Task {
            await resolve(call, ["hasLifetimeAccess": await hasLifetimeAccess()])
        }
    }

    private func productPayload(_ product: Product) -> [String: Any] {
        [
            "id": product.id,
            "displayName": product.displayName,
            "description": product.description,
            "displayPrice": product.displayPrice
        ]
    }

    private func hasLifetimeAccess() async -> Bool {
        for await result in Transaction.currentEntitlements {
            guard let transaction = try? checkVerified(result),
                  transaction.productID == lifetimeProductId,
                  transaction.revocationDate == nil else {
                continue
            }
            return true
        }
        return false
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe):
            return safe
        case .unverified:
            throw StoreKitError.verificationFailed
        }
    }

    @MainActor private func resolve(_ call: CAPPluginCall, _ data: [String: Any] = [:]) {
        call.resolve(data)
    }

    @MainActor private func reject(_ call: CAPPluginCall, _ message: String) {
        call.reject(message)
    }
}

private enum StoreKitError: Error {
    case verificationFailed
}
