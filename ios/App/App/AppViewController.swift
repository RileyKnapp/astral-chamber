import Capacitor

class AppViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginType(NativeAmbientPlugin.self)
    }
}
