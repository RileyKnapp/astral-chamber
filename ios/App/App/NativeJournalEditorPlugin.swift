import UIKit

final class NativeJournalEditorViewController: UIViewController, UITextViewDelegate {
    var onCancel: (() -> Void)?
    var onDone: ((String, String, String, Bool) -> Void)?

    private let initialTitle: String
    private let initialBody: String
    private var selectedMood: String
    private var lucid: Bool
    private let titleField = UITextField()
    private let bodyView = UITextView()
    private let bodyPlaceholder = UILabel()
    private let moodButton = UIButton(type: .system)
    private let yesButton = UIButton(type: .system)
    private let noButton = UIButton(type: .system)
    private let accent = UIColor(red: 192 / 255, green: 176 / 255, blue: 240 / 255, alpha: 1)
    private let secondary = UIColor(red: 127 / 255, green: 169 / 255, blue: 200 / 255, alpha: 1)
    private let moods = [
        "calm",
        "beautiful",
        "exciting",
        "enlightening",
        "blissful",
        "peaceful",
        "joyful",
        "inspiring",
        "mysterious",
        "surreal",
        "vivid",
        "nostalgic",
        "emotional",
        "intense",
        "uneasy",
        "strange"
    ]

    init(titleText: String, bodyText: String, moodText: String, lucid: Bool) {
        initialTitle = titleText
        initialBody = bodyText
        selectedMood = moodText
        self.lucid = lucid
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 5 / 255, green: 8 / 255, blue: 17 / 255, alpha: 1)
        navigationItem.title = "DREAM JOURNAL"
        navigationController?.navigationBar.prefersLargeTitles = false
        navigationController?.navigationBar.tintColor = accent
        navigationController?.navigationBar.titleTextAttributes = [
            .foregroundColor: UIColor.white,
            .font: UIFont.monospacedSystemFont(ofSize: 13, weight: .semibold)
        ]
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "CANCEL",
            style: .plain,
            target: self,
            action: #selector(cancel)
        )
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "DONE",
            style: .done,
            target: self,
            action: #selector(done)
        )

        let prompt = UILabel()
        prompt.text = "Record what came through before it dissolves."
        prompt.textColor = secondary
        prompt.font = UIFont.monospacedSystemFont(ofSize: 12, weight: .regular)
        prompt.numberOfLines = 0

        titleField.placeholder = "Title of the dream"
        configureField(titleField)
        titleField.text = initialTitle
        titleField.returnKeyType = .next
        titleField.addTarget(self, action: #selector(focusBody), for: .editingDidEndOnExit)

        bodyView.backgroundColor = UIColor.white.withAlphaComponent(0.04)
        bodyView.textColor = UIColor(red: 207 / 255, green: 231 / 255, blue: 255 / 255, alpha: 1)
        bodyView.tintColor = accent
        bodyView.font = UIFont.systemFont(ofSize: 17)
        bodyView.layer.borderColor = UIColor.white.withAlphaComponent(0.14).cgColor
        bodyView.layer.borderWidth = 1
        bodyView.layer.cornerRadius = 12
        bodyView.textContainerInset = UIEdgeInsets(top: 14, left: 10, bottom: 14, right: 10)
        bodyView.keyboardDismissMode = .interactive
        bodyView.delegate = self
        bodyView.text = initialBody

        bodyPlaceholder.text = "What did you see..."
        bodyPlaceholder.textColor = UIColor.white.withAlphaComponent(0.28)
        bodyPlaceholder.font = bodyView.font
        bodyPlaceholder.isUserInteractionEnabled = false
        bodyView.addSubview(bodyPlaceholder)
        bodyPlaceholder.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bodyPlaceholder.topAnchor.constraint(equalTo: bodyView.topAnchor, constant: 15),
            bodyPlaceholder.leadingAnchor.constraint(equalTo: bodyView.leadingAnchor, constant: 15)
        ])
        updatePlaceholder()

        let moodLabel = fieldLabel("MOOD")
        configureMoodButton()

        let lucidityLabel = fieldLabel("LUCIDITY ACHIEVED?")
        configureLucidityButtons()
        let lucidityStack = UIStackView(arrangedSubviews: [yesButton, noButton])
        lucidityStack.axis = .horizontal
        lucidityStack.spacing = 12
        lucidityStack.distribution = .fillEqually

        let stack = UIStackView(arrangedSubviews: [
            prompt,
            titleField,
            bodyView,
            moodLabel,
            moodButton,
            lucidityLabel,
            lucidityStack
        ])
        stack.axis = .vertical
        stack.spacing = 14
        view.addSubview(stack)
        stack.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            bodyView.heightAnchor.constraint(greaterThanOrEqualToConstant: 210),
            stack.bottomAnchor.constraint(lessThanOrEqualTo: view.keyboardLayoutGuide.topAnchor, constant: -16)
        ])

        DispatchQueue.main.async { [weak self] in
            self?.titleField.becomeFirstResponder()
        }
    }

    private func configureField(_ field: UITextField) {
        field.backgroundColor = UIColor.white.withAlphaComponent(0.04)
        field.textColor = .white
        field.tintColor = accent
        field.font = UIFont.systemFont(ofSize: 17)
        field.layer.borderColor = UIColor.white.withAlphaComponent(0.14).cgColor
        field.layer.borderWidth = 1
        field.layer.cornerRadius = 12
        field.setLeftPadding(14)
        field.heightAnchor.constraint(equalToConstant: 52).isActive = true
        field.attributedPlaceholder = NSAttributedString(
            string: field.placeholder ?? "",
            attributes: [.foregroundColor: UIColor.white.withAlphaComponent(0.28)]
        )
    }

    private func fieldLabel(_ text: String) -> UILabel {
        let label = UILabel()
        label.textColor = secondary
        label.font = UIFont.monospacedSystemFont(ofSize: 12, weight: .medium)
        label.attributedText = NSAttributedString(
            string: text,
            attributes: [
                .foregroundColor: secondary,
                .font: UIFont.monospacedSystemFont(ofSize: 12, weight: .medium),
                .kern: 5
            ]
        )
        return label
    }

    private func configureMoodButton() {
        moodButton.contentHorizontalAlignment = .left
        moodButton.backgroundColor = UIColor.white.withAlphaComponent(0.04)
        moodButton.tintColor = accent
        moodButton.titleLabel?.font = UIFont.monospacedSystemFont(ofSize: 13, weight: .medium)
        moodButton.layer.borderColor = UIColor.white.withAlphaComponent(0.14).cgColor
        moodButton.layer.borderWidth = 1
        moodButton.layer.cornerRadius = 12
        moodButton.heightAnchor.constraint(equalToConstant: 52).isActive = true
        moodButton.contentEdgeInsets = UIEdgeInsets(top: 0, left: 14, bottom: 0, right: 14)
        moodButton.showsMenuAsPrimaryAction = true
        moodButton.menu = UIMenu(children: moods.map { mood in
            UIAction(title: mood.uppercased()) { [weak self] _ in
                self?.selectedMood = mood
                self?.updateMoodButton()
            }
        })
        updateMoodButton()
    }

    private func updateMoodButton() {
        let isEmpty = selectedMood.isEmpty
        moodButton.setTitle(isEmpty ? "What kind of experience was it?" : selectedMood.uppercased(), for: .normal)
        moodButton.setTitleColor(isEmpty ? secondary.withAlphaComponent(0.65) : accent, for: .normal)
    }

    private func configureLucidityButtons() {
        configureLucidityButton(yesButton, title: "YES")
        configureLucidityButton(noButton, title: "NO")
        yesButton.addTarget(self, action: #selector(selectLucid), for: .touchUpInside)
        noButton.addTarget(self, action: #selector(selectNotLucid), for: .touchUpInside)
        updateLucidityButtons()
    }

    private func configureLucidityButton(_ button: UIButton, title: String) {
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = UIFont.monospacedSystemFont(ofSize: 13, weight: .medium)
        button.layer.borderWidth = 1
        button.layer.cornerRadius = 12
        button.heightAnchor.constraint(equalToConstant: 52).isActive = true
    }

    @objc private func selectLucid() {
        lucid = true
        updateLucidityButtons()
    }

    @objc private func selectNotLucid() {
        lucid = false
        updateLucidityButtons()
    }

    private func updateLucidityButtons() {
        styleLucidityButton(yesButton, selected: lucid)
        styleLucidityButton(noButton, selected: !lucid)
    }

    private func styleLucidityButton(_ button: UIButton, selected: Bool) {
        button.backgroundColor = selected ? accent.withAlphaComponent(0.18) : UIColor.white.withAlphaComponent(0.02)
        button.layer.borderColor = selected ? accent.cgColor : UIColor.white.withAlphaComponent(0.14).cgColor
        button.setTitleColor(selected ? UIColor.white : secondary, for: .normal)
    }

    @objc private func focusBody() {
        bodyView.becomeFirstResponder()
    }

    @objc private func cancel() {
        dismiss(animated: true) { [onCancel] in onCancel?() }
    }

    @objc private func done() {
        let title = titleField.text ?? ""
        let body = bodyView.text ?? ""
        let mood = selectedMood
        let achievedLucidity = lucid
        dismiss(animated: true) { [onDone] in onDone?(title, body, mood, achievedLucidity) }
    }

    func textViewDidChange(_ textView: UITextView) {
        updatePlaceholder()
    }

    private func updatePlaceholder() {
        bodyPlaceholder.isHidden = !bodyView.text.isEmpty
    }
}

private extension UITextField {
    func setLeftPadding(_ width: CGFloat) {
        let padding = UIView(frame: CGRect(x: 0, y: 0, width: width, height: 1))
        leftView = padding
        leftViewMode = .always
    }
}
