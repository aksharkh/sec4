export default function SectionLabel({
  index,
  text,
  light = false,
}: {
  index: string;
  text: string;
  light?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] ${
        light ? "text-white/50" : "text-mute"
      }`}
    >
      <span className="text-gold">{index}</span>
      <span className={`h-px w-8 ${light ? "bg-white/30" : "bg-ink/25"}`} />
      {text}
    </p>
  );
}
