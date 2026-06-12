import Capacitor

class AppViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginType(NativeAmbientPlugin.self)
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
    }
}
