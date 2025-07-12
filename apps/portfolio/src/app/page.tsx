import { Animate } from "@/app/components/animate";
import { ResumeCard } from "@/app/components/ResumeCard";
import { DATA } from "@/app/data/info";
import { cn } from "@/app/lib/utils";
import * as Avatar from "@radix-ui/react-avatar";
import Link from "next/link";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const firstName = DATA.name.split(" ")[0];
  const initials = DATA.initials;

  return (
    <main
      className={cn(
        "m-5 flex min-h-[100dvh] flex-col p-2.5",
        process.env.NEXT_PUBLIC_DEBUG && "border-2 border-blue-600"
      )}
    >
      <section id="header">
        <div
          className={cn(
            "mx-auto w-full max-w-2xl",
            process.env.NEXT_PUBLIC_DEBUG && "border-2 border-yellow-600"
          )}
        >
          <div className="flex">
            <div className="flex flex-1 flex-col">
              <Animate
                delay={BLUR_FADE_DELAY}
                className={cn(
                  "grow text-3xl font-bold tracking-tighter sm:text-5xl",
                  process.env.NEXT_PUBLIC_DEBUG && "border-2 border-blue-600"
                )}
                yOffset={-8}
              >
                <span>{`Hey there, I'm ${firstName}!`}</span>
              </Animate>
              <Animate
                className={cn(
                  "mt-auto md:text-xl",
                  process.env.NEXT_PUBLIC_DEBUG && "border-2 border-blue-600"
                )}
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
              <Avatar.Root
                className={cn(
                  "flex w-36",
                  process.env.NEXT_PUBLIC_DEBUG && "border-2 border-green-600"
                )}
              >
                <Avatar.Image
                  className="aspect-square h-full w-full rounded-full border-2"
                  src="/me.png"
                  alt={initials}
                />
                <Avatar.Fallback
                  className="bg-muted flex h-full w-full items-center justify-center rounded-full"
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
        <div
          className={cn(
            "mt-5",
            process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
          )}
        >
          <Animate delay={BLUR_FADE_DELAY * 3}>
            <h2 className="text-xl font-bold">About</h2>
          </Animate>
          <Animate delay={BLUR_FADE_DELAY * 4}>
            <Markdown className="text-muted-foreground prose max-w-full text-pretty font-sans text-sm">
              {DATA.summary}
            </Markdown>
          </Animate>
        </div>
      </section>
      <section id="work">
        <div
          className={cn(
            "mt-5 flex min-h-0 flex-col gap-y-3",
            process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
          )}
        >
          <Animate delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
          </Animate>
          {DATA.work.map((work, id) => (
            <Animate key={work.company} delay={BLUR_FADE_DELAY * 6 + id * 0.05}>
              <ResumeCard
                key={work.company}
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title}
                href={work.href}
                badges={work.badges}
                period={`${work.start} - ${work.end || "Present"}`}
                description={work.description}
              />
            </Animate>
          ))}
        </div>
      </section>
      <section id="education">
        <div
          className={cn(
            "mt-5 flex min-h-0 flex-col gap-y-3",
            process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
          )}
        >
          <Animate delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </Animate>
          {DATA.education.map((education, id) => (
            <Animate
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
                focus={education.focus}
              />
            </Animate>
          ))}
        </div>
      </section>
      <section id="contact">
        <div
          className={cn(
            "mt-5 flex min-h-0 flex-col gap-y-3",
            process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
          )}
        >
          <div className="space-y-2">
            <Animate delay={BLUR_FADE_DELAY * 9}>
              <h2 className="text-xl font-bold">Contact</h2>
            </Animate>
            <p className="text-muted-foreground mx-auto flex flex-col md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              <Animate delay={BLUR_FADE_DELAY * 11} className="text-sm">
                Shoot me an email at{" "}
                <Link
                  href={`mailto:${DATA.contact.email}`}
                  className="text-blue-500 hover:underline"
                >
                  hameldesai0@gmail.com
                </Link>
              </Animate>
            </p>
          </div>
          <div className="flex flex-col">
            <div
              className={cn(
                "flex gap-3",
                process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
              )}
            >
              {Object.entries(DATA.contact.social).map(([key, value]) => (
                <div
                  key={key}
                  className={
                    process.env.NEXT_PUBLIC_DEBUG &&
                    "border-2 border-purple-600"
                  }
                >
                  <Animate delay={BLUR_FADE_DELAY * 12}>
                    <Link
                      href={value.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div>{value.icon()}</div>
                    </Link>
                  </Animate>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
