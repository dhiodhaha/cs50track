import server from "@tanstack/react-start/server-entry";
import { handleApi, type Env } from "./api";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    try {
      const response = await server.fetch(request);
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store");
      headers.set("Referrer-Policy", "no-referrer");
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      console.error("CS50 Track page request failed");
      return new Response("CS50 Track could not load. Please try again.", {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
  },
} satisfies ExportedHandler<Env>;
