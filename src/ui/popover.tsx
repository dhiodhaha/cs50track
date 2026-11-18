import { useEffect, useRef, useState, type ReactNode } from "react";

/** A button that opens a small panel. Escape or a click outside closes it. */
export function Popover({
  label,
  trigger,
  className = "",
  triggerClassName = "bar-button",
  align = "end",
  returnFocus = false,
  children,
}: {
  label: string;
  trigger: ReactNode;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "end";
  /** Put focus back on the button when the panel closes itself after a choice. */
  returnFocus?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  useEffect(() => {
    if (open) panel.current?.scrollIntoView({ block: "nearest" });
  }, [open]);
  return (
    <div className={`popover ${className}`} ref={root}>
      <button
        ref={button}
        type="button"
        className={triggerClassName}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panel}
          className="popover-panel"
          data-align={align}
          role="group"
          aria-label={label}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
