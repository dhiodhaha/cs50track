import { X } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/** Matches the exit transition in study.css. */
const EXIT_MS = 150;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab and Shift+Tab inside the dialog instead of leaving for the browser's own controls. */
function trapTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
  ].filter((item) => item.getClientRects().length > 0);
  const first = items[0];
  const last = items.at(-1);
  if (!first || !last) return;
  const here = document.activeElement;
  if (event.shiftKey && here === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && here === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * A modal panel that slides in from one side, or up from the bottom on a
 * phone. It stays mounted while it leaves so the exit can play, and closing
 * mid-entrance reverses the same transition.
 */
export function Sheet({
  open,
  label,
  side = "end",
  onClose,
  fallbackFocus,
  children,
}: {
  open: boolean;
  label: string;
  side?: "start" | "end";
  onClose: () => void;
  /** Where focus goes on close when the opener is gone, as after a reload. */
  fallbackFocus?: () => HTMLElement | null;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  if (open && !mounted) setMounted(true);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!mounted || !element) return;
    if (open) {
      if (!element.open) {
        opener.current = document.activeElement as HTMLElement | null;
        element.showModal();
      }
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    setShown(false);
    const timer = setTimeout(() => {
      element.close();
      setMounted(false);
      const back = opener.current;
      const target =
        back?.isConnected && back !== document.body
          ? back
          : (fallbackFocus?.() ?? null);
      target?.focus({ preventScroll: true });
      opener.current = null;
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <dialog
      ref={dialog}
      className="sheet"
      data-side={side}
      data-state={shown ? "open" : "closed"}
      aria-label={label}
      onKeyDown={trapTab}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="sheet-panel">
        <div className="sheet-top">
          <span className="sheet-grab" aria-hidden />
          <button
            type="button"
            className="sheet-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="sheet-scroll">{children}</div>
      </div>
    </dialog>
  );
}
