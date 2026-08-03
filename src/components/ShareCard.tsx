const APP_SHARE_URL = "https://apps.apple.com/app/id6795283007";

type Props = { kind: "streak"; days: number } | { kind: "journey"; name: string; tag?: string };

export function ShareCard(props: Props) {
  const title =
    props.kind === "streak"
      ? `${props.days}-day dream journaling streak`
      : `${props.name} in The Astral Chamber`;
  const body =
    props.kind === "streak"
      ? `I've journaled my dreams ${props.days} days in a row with The Astral Chamber.`
      : "This was spiritually awesome. Check it out!";

  const share = async () => {
    const data = {
      title,
      text: body,
      url: APP_SHARE_URL,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        return;
      }
    }

    if (typeof window !== "undefined") {
      window.location.href = `sms:&body=${encodeURIComponent(`${body} ${APP_SHARE_URL}`)}`;
    }
  };

  return (
    <button
      onClick={share}
      className="rounded-sm border border-[#c0b0f0]/40 px-3 py-1 text-[10px] tracking-[0.25em] text-[#c0b0f0] hover:border-[#c0b0f0]"
    >
      ◆ SHARE
    </button>
  );
}
