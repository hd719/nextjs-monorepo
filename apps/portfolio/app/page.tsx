import Animate from "@/components/animate";
import Markdown from "react-markdown";
import { DATA } from "@/data/info";
import * as Avatar from "@radix-ui/react-avatar";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const firstName = DATA.name.split(" ")[0];
  const initials = DATA.initials;

  return (
    <main className="flex flex-col border-2 border-blue-600 m-5 p-2.5">
      <section id="header">
        <div className="mx-auto w-full max-w-2xl border-2 border-yellow-600">
          <div className="flex">
            <div className="flex flex-col flex-1">
              <Animate
                delay={BLUR_FADE_DELAY}
                className="grow text-3xl font-bold tracking-tighter sm:text-5xl border-2 border-green-600"
                yOffset={-8}
              >
                <span>{`Hey there, I'm ${firstName}!`}</span>
              </Animate>
              <Animate
                className="mt-auto md:text-xl border-2 border-green-600"
                delay={BLUR_FADE_DELAY}
                yOffset={-8} // not being used atm
              >
                <span>{DATA.description}</span>
              </Animate>
            </div>
            <Animate
              delay={BLUR_FADE_DELAY}
              yOffset={-8} // not being used atm
            >
              <Avatar.Root className="flex w-36 border-2 border-green-600">
                <Avatar.Image
                  className="aspect-square h-full w-full rounded-full border-2"
                  src="/me.png"
                  alt={initials}
                />
                <Avatar.Fallback
                  className="flex h-full w-full items-center justify-center rounded-full bg-muted"
                  delayMs={600}
                >
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
            </Animate>
          </div>
        </div>
      </section>
      <section id="about">
        <div className="border-2 border-orange-600 mt-5">
          <Animate delay={BLUR_FADE_DELAY * 3}>
            <h2 className="text-xl font-bold">About</h2>
          </Animate>
          <Animate delay={BLUR_FADE_DELAY * 4}>
            <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
              {DATA.summary}
            </Markdown>
          </Animate>
        </div>
      </section>
    </main>
  );
}
