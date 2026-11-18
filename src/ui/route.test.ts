import { describe, expect, it } from "vitest";
import { parseRoute, routeHash, type Route } from "./route";

describe("hash routes", () => {
  it("defaults to home and ignores the old learn routes", () => {
    expect(parseRoute("")).toEqual({ name: "home" });
    expect(parseRoute("#learn/week-0-binary")).toEqual({ name: "home" });
    expect(parseRoute("#session")).toEqual({ name: "home" });
  });

  it("sends the old track address to home", () => {
    expect(parseRoute("#track")).toEqual({ name: "home" });
  });

  it("opens the week sheet from a unit address", () => {
    expect(parseRoute("#home/unit/week-3")).toEqual({
      name: "home",
      unitId: "week-3",
    });
    expect(parseRoute("#home/unit/project")).toEqual({
      name: "home",
      unitId: "project",
    });
  });

  it("ignores a unit that does not exist or an incomplete sheet address", () => {
    expect(parseRoute("#home/unit/week-99")).toEqual({ name: "home" });
    expect(parseRoute("#home/unit")).toEqual({ name: "home" });
    expect(parseRoute("#home/unit/%E0%A4%A")).toEqual({ name: "home" });
  });

  it("round-trips every route", () => {
    const routes: Route[] = [
      { name: "home" },
      { name: "home", unitId: "week-1" },
      { name: "recall" },
      { name: "session", stepId: "week-1-lecture-p1" },
    ];
    for (const route of routes)
      expect(parseRoute(routeHash(route))).toEqual(route);
  });
});
