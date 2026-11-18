import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "../ui/public";

export const Route = createFileRoute("/p")({
  head: () => ({
    meta: [
      { title: "CS50x progress record · CS50Track" },
      {
        name: "description",
        content:
          "A public weekly record of Harvard CS50x in ten weeks: each week on time, late or missed against its own deadline.",
      },
    ],
  }),
  component: PublicPage,
});
