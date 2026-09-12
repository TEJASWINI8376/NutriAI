import { Link } from "@tanstack/react-router";
import { Icon } from "./Icon";

export function AppHeader({ title, backTo }: { title: string; backTo?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2">
          {backTo ? (
            <Link
              to={backTo}
              aria-label="Back"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </Link>
          ) : null}
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon name="nutrition" className="text-[18px]" />
            </span>
            <h1 className="truncate text-lg font-bold tracking-tight text-on-surface">{title}</h1>
          </div>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
          <Icon name="person" className="text-[18px]" />
        </span>
      </div>
    </header>
  );
}
