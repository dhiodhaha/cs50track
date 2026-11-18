import { useSyncExternalStore } from "react";
import { courseUnits } from "../lib/course";

/** `unitId` on home means the week sheet for that unit is open over the course page. */
export type Route =
  | { name: "home"; unitId?: string }
  | { name: "recall" }
  | { name: "session"; stepId: string };

const knownUnit = (id: string) => courseUnits.some((unit) => unit.id === id);

export function parseRoute(hash: string): Route {
  const [head = "", rest = "", id = ""] = hash.replace(/^#/, "").split("/");
  if (head === "recall") return { name: "recall" };
  try {
    if (head === "session" && rest)
      return { name: "session", stepId: decodeURIComponent(rest) };
    if (head === "home" && rest === "unit" && id) {
      const unitId = decodeURIComponent(id);
      if (knownUnit(unitId)) return { name: "home", unitId };
    }
  } catch {
    return { name: "home" };
  }
  return { name: "home" };
}

export function routeHash(route: Route): string {
  switch (route.name) {
    case "session":
      return `#session/${encodeURIComponent(route.stepId)}`;
    case "home":
      return route.unitId
        ? `#home/unit/${encodeURIComponent(route.unitId)}`
        : "#home";
    case "recall":
      return "#recall";
  }
}

/** Where the last hash change came from. `null` until the first one, as after a reload. */
let cameFrom: string | null = null;
if (typeof window !== "undefined")
  window.addEventListener("hashchange", (event) => {
    cameFrom = new URL(event.oldURL).hash;
  });

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

export function useHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
}

export function navigate(route: Route) {
  window.location.hash = routeHash(route);
  if (route.name !== "home" || !route.unitId) window.scrollTo(0, 0);
}

/**
 * Closing the sheet steps back when it was opened from the course page, so
 * Back never lands on a sheet the learner just closed. After a reload or a
 * pasted link there is nothing to step back to, so it replaces the address.
 */
export function closeUnitSheet() {
  const origin = cameFrom === null ? null : parseRoute(cameFrom);
  if (origin?.name === "home" && !origin.unitId) window.history.back();
  else window.location.replace("#home");
}

const WARMUP_KEY = "cs50track.warmup";

/** Home asks for the recall warm-up once. A reload or a jump from a sheet does not. */
export function requestWarmup(stepId: string) {
  try {
    window.sessionStorage.setItem(WARMUP_KEY, stepId);
  } catch {
    return;
  }
}

export function wantsWarmup(stepId: string): boolean {
  try {
    return window.sessionStorage.getItem(WARMUP_KEY) === stepId;
  } catch {
    return false;
  }
}

export function clearWarmup() {
  try {
    window.sessionStorage.removeItem(WARMUP_KEY);
  } catch {
    return;
  }
}
