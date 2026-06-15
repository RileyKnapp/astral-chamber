import Capacitor
import WebKit

class AppViewController: CAPBridgeViewController, WKScriptMessageHandler {
    override func capacitorDidLoad() {
        bridge?.registerPluginType(NativeAmbientPlugin.self)
        webView?.configuration.userContentController.add(self, name: "astralJournal")
        URLCache.shared.removeAllCachedResponses()
        WKWebsiteDataStore.default().removeData(
            ofTypes: [WKWebsiteDataTypeDiskCache, WKWebsiteDataTypeMemoryCache],
            modifiedSince: .distantPast
        ) {}
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
        webView?.scrollView.keyboardDismissMode = .none
    }

    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: "astralJournal")
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "astralJournal",
              let draft = message.body as? [String: Any],
              let requestId = draft["requestId"] as? String else {
            return
        }

        let editor = NativeJournalEditorViewController(
            titleText: draft["title"] as? String ?? "",
            bodyText: draft["body"] as? String ?? "",
            moodText: draft["mood"] as? String ?? "",
            lucid: draft["lucid"] as? Bool ?? false
        )
        editor.onCancel = { [weak self] in
            self?.sendJournalResult([
                "requestId": requestId,
                "title": "",
                "body": "",
                "cancelled": true
            ])
        }
        editor.onDone = { [weak self] title, body, mood, lucid in
            self?.sendJournalResult([
                "requestId": requestId,
                "title": title,
                "body": body,
                "mood": mood,
                "lucid": lucid
            ])
        }

        let navigation = UINavigationController(rootViewController: editor)
        navigation.modalPresentationStyle = .pageSheet
        if let sheet = navigation.sheetPresentationController {
            sheet.detents = [.large()]
            sheet.prefersGrabberVisible = true
            sheet.preferredCornerRadius = 24
        }
        present(navigation, animated: true)
    }

    private func sendJournalResult(_ result: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(result),
              let data = try? JSONSerialization.data(withJSONObject: result),
              let json = String(data: data, encoding: .utf8) else {
            return
        }
        webView?.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('astralJournalResult', { detail: \(json) }));"
        )
    }
}
