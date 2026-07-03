import Capacitor
import UIKit

@objc(NativeJournalExportPlugin)
public class NativeJournalExportPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeJournalExportPlugin"
    public let jsName = "NativeJournalExport"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "shareJournalExport", returnType: CAPPluginReturnPromise)
    ]

    @objc public func shareJournalExport(_ call: CAPPluginCall) {
        guard let fileName = call.getString("fileName"),
              let contents = call.getString("contents") else {
            call.reject("Missing journal export contents")
            return
        }

        let safeFileName = fileName
            .components(separatedBy: CharacterSet(charactersIn: "/:\\?%*|\"<>"))
            .joined(separator: "-")
        let exportURL = FileManager.default.temporaryDirectory.appendingPathComponent(safeFileName)

        do {
            try contents.write(to: exportURL, atomically: true, encoding: .utf8)
        } catch {
            call.reject("Unable to prepare journal export")
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self,
                  let viewController = self.bridge?.viewController else {
                call.reject("Unable to present share sheet")
                return
            }

            let activity = UIActivityViewController(activityItems: [exportURL], applicationActivities: nil)
            activity.popoverPresentationController?.sourceView = viewController.view
            activity.completionWithItemsHandler = { _, completed, _, error in
                try? FileManager.default.removeItem(at: exportURL)
                if let error {
                    call.reject("Unable to share journal export: \(error.localizedDescription)")
                } else {
                    call.resolve(["completed": completed])
                }
            }
            viewController.present(activity, animated: true)
        }
    }
}
