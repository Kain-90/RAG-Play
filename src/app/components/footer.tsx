import { Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const githubUrl = "https://github.com/Kain-90/RAG-Play";
  const myUrl = "https://kainhub.vercel.app";
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by{" "}
              <Link
                href={myUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Kain
              </Link>
              . The source code is available on{" "}
              <Link
                href={githubUrl}
                target="_blank"
                rel="noopener nofollow"
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                GitHub
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Link
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-background hover:bg-muted"
            >
              <Github className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
