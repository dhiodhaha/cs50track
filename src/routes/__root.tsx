import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import designCss from "@agentic-ui/design-system/styles.css?url";
import documentCss from "@agentic-ui/design-system/document.css?url";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CS50 Track · A little further, every day." },
      {
        name: "description",
        content: "Your personal ten-week study plan for Harvard CS50x.",
      },
    ],
    links: [
      { rel: "stylesheet", href: designCss },
      { rel: "stylesheet", href: documentCss },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "preload",
        href: "/fonts/AlloVariable.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: Root,
  shellComponent: Document,
  notFoundComponent: () => (
    <main className="empty-page">
      <h1>This page took a wrong turn.</h1>
      <a href="/">Back to your track</a>
    </main>
  ),
  errorComponent: ({ error, reset }) => (
    <main className="empty-page">
      <h1>Let’s try that again.</h1>
      <p>
        {error instanceof Error ? error.message : "This page could not load."}
      </p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </main>
  ),
});
function Root() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Outlet />
    </QueryClientProvider>
  );
}
function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <HeadContent />
      </head>
      <body data-theme="light">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
