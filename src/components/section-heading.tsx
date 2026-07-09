import { Flourish } from "./ornaments";

export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="text-center">
      <p className="font-script text-3xl text-gold-deep sm:text-4xl">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.16em] text-ink sm:text-3xl">
        {title}
      </h2>
      <Flourish className="mx-auto mt-5 w-52 text-gold" />
    </div>
  );
}
