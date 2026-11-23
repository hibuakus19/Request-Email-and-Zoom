import Link from "next/link";
import { MailIcon, VideoIcon } from "@/components/icons";

const featureLinkClass =
  "group flex flex-col items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view =
    params.view === "user" || params.view === "admin"
      ? `?view=${params.view}`
      : "";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="grid grid-cols-2 gap-6 sm:gap-10">
        <Link
          href={`/home/email${view}`}
          aria-label="Request Email"
          className={featureLinkClass}
        >
          <span className="grid size-28 place-items-center rounded-3xl bg-accent text-white shadow-sm transition-colors group-hover:bg-accent-hover sm:size-32">
            <MailIcon size={46} />
          </span>
          <span className="text-body-sm font-semibold text-ink">
            Request Email
          </span>
        </Link>

        <Link
          href={`/home/zoom${view}`}
          aria-label="Request Zoom"
          className={featureLinkClass}
        >
          <span className="grid size-28 place-items-center rounded-3xl bg-success text-white shadow-sm transition-colors group-hover:bg-success-dark sm:size-32">
            <VideoIcon size={46} />
          </span>
          <span className="text-body-sm font-semibold text-ink">
            Request Zoom
          </span>
        </Link>
      </div>
    </div>
  );
}
