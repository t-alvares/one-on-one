import { Highlighter } from "@/components/ui/highlighter";

export function LoginHero() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-white p-12">
      <div className="max-w-lg">
        {/* Term */}
        <h1 className="text-7xl font-bold text-rich-black mb-3">1:1</h1>

        {/* Pronunciation & Part of Speech */}
        <p className="text-lg text-text-secondary mb-8">
          <span className="italic">/wʌn ɒn wʌn/</span>
          <span className="mx-2">·</span>
          <span>noun</span>
        </p>

        {/* Definition */}
        <p className="text-xl text-text-primary leading-relaxed mb-6">
          A recurring meeting between a leader and team member where{" "}
          <Highlighter action="highlight" color="#87CEFA" strokeWidth={2} animationDuration={800}>
            meaningful conversations
          </Highlighter>{" "}
          happen,{" "}
          <Highlighter action="underline" color="#FF9800" strokeWidth={2} animationDuration={600}>
            growth
          </Highlighter>{" "}
          is nurtured, and{" "}
          <Highlighter action="highlight" color="#87CEFA" strokeWidth={2} animationDuration={800}>
            trust
          </Highlighter>{" "}
          is strengthened.
        </p>

        {/* Extended definition */}
        <p className="text-xl text-text-primary leading-relaxed mb-8">
          A space to{" "}
          <Highlighter action="underline" color="#FF9800" strokeWidth={2} animationDuration={700}>
            prepare
          </Highlighter>
          ,{" "}
          <Highlighter action="underline" color="#FF9800" strokeWidth={2} animationDuration={800}>
            reflect
          </Highlighter>
          , and{" "}
          <Highlighter action="underline" color="#FF9800" strokeWidth={2} animationDuration={900}>
            follow through
          </Highlighter>
          —all in{" "}
          <Highlighter action="underline" color="#FF9800" strokeWidth={2} animationDuration={1000}>
            one place
          </Highlighter>
          .
        </p>

        {/* See also */}
        <p className="text-base text-text-tertiary">
          <span className="italic">see also:</span>{" "}
          <span className="text-text-secondary">alignment, development, connection</span>
        </p>
      </div>
    </div>
  );
}
