import { useEffect, useRef, useState } from "react";
import { ignore, patchStudy, useStudy } from "./context";
import { Modal } from "./forms";

/** The public-page switch, name, link and badge snippet, in a dialog. */
export function PublicPageDialog({ onClose }: { onClose: () => void }) {
  const { state, update } = useStudy();
  const page = state.study?.publicPage ?? { enabled: false, name: "" };
  const [name, setName] = useState(page.name);
  const [copied, setCopied] = useState(false);
  const badge = `![CS50 progress](${window.location.origin}/api/public/badge.svg)`;
  const save = (next: Partial<typeof page>) =>
    void update((s) =>
      patchStudy(s, (study) => ({
        ...study,
        publicPage: { ...study.publicPage, ...next },
      })),
    ).catch(ignore);

  const latest = useRef({ name, saved: page.name, save });
  latest.current = { name, saved: page.name, save };
  useEffect(
    () => () => {
      const { name: typed, saved, save: write } = latest.current;
      if (typed.trim() !== saved) write({ name: typed.trim() });
    },
    [],
  );

  return (
    <Modal title="Public page" onClose={onClose}>
      <div className="public-block">
        <p className="muted">
          The page shows only your week results and dates. It never shows notes,
          answers or study time.
        </p>
        <div className="switch-row">
          <button
            type="button"
            role="switch"
            aria-checked={page.enabled}
            aria-label="Share a public page"
            className="switch"
            onClick={() => save({ enabled: !page.enabled })}
          />
          <span>
            {page.enabled ? "Shared at " : "Not shared. It will live at "}
            <a className="text-link" href="/p" target="_blank" rel="noreferrer">
              /p
            </a>
          </span>
        </div>
        <label className="field">
          Name on the page
          <input
            name="publicName"
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => name !== page.name && save({ name: name.trim() })}
            onKeyDown={(event) =>
              event.key === "Enter" && event.currentTarget.blur()
            }
          />
        </label>
        <div className="snippet">
          <code>{badge}</code>
          <button
            type="button"
            className="button secondary small"
            onClick={() => {
              void navigator.clipboard
                .writeText(badge)
                .then(() => setCopied(true))
                .catch(ignore);
            }}
          >
            {copied ? "Copied" : "Copy badge"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
