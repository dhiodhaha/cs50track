import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { z } from "zod";
import { appStateSchema, type AppState } from "../lib/model";
import { createInitialState } from "../lib/schedule";

const authSchema = z.object({
  authenticated: z.boolean(),
  email: z.string().optional(),
  development: z.boolean(),
  configured: z.boolean(),
});
const savedSchema = z.object({
  revision: z.number(),
  state: appStateSchema.nullable(),
});
type SavedState = z.infer<typeof savedSchema>;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api(path: string, body?: unknown, method = "POST") {
  const response = await fetch(
    path,
    body === undefined
      ? { credentials: "same-origin" }
      : {
          method,
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const result: unknown = await response.json();
  if (!response.ok) {
    const error = z
      .object({ error: z.string().optional(), message: z.string().optional() })
      .safeParse(result);
    throw new ApiError(
      error.success
        ? (error.data.error ??
            error.data.message ??
            "Your change could not be saved.")
        : "The server could not complete this request.",
      response.status,
    );
  }
  return result;
}
export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => authSchema.parse(await api("/api/auth/session")),
  });
}
export function useStudyStore(enabled: boolean) {
  const client = useQueryClient();
  const initial = useRef<AppState | null>(null);
  if (!initial.current) initial.current = createInitialState();
  const [error, setError] = useState("");
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const query = useQuery({
    queryKey: ["study"],
    enabled,
    queryFn: async () => savedSchema.parse(await api("/api/state")),
    staleTime: 15000,
  });
  const mutation = useMutation({
    mutationFn: async (change: (state: AppState) => AppState) => {
      await client.cancelQueries({ queryKey: ["study"] });
      const previous = client.getQueryData<SavedState>(["study"]);
      if (!previous || !initial.current)
        throw new Error("Your study plan is still loading.");
      const state = appStateSchema.parse(
        change(previous.state ?? initial.current),
      );
      const payload = {
        revision: previous.revision,
        state,
        operationId: crypto.randomUUID(),
      };
      let result: { revision: number };
      try {
        result = z
          .object({ revision: z.number() })
          .parse(await api("/api/state", payload, "PUT"));
      } catch (failure) {
        if (failure instanceof ApiError && failure.status < 500) throw failure;
        result = z
          .object({ revision: z.number() })
          .parse(await api("/api/state", payload, "PUT"));
      }
      client.setQueryData<SavedState>(["study"], {
        revision: result.revision,
        state,
      });
      setError("");
      return state;
    },
    onError: (failure) => {
      setError(failure.message);
      void client.invalidateQueries({ queryKey: ["study"] });
    },
  });
  function update(change: (state: AppState) => AppState) {
    const action = queue.current
      .catch(() => undefined)
      .then(() => mutation.mutateAsync(change));
    queue.current = action;
    return action;
  }
  return {
    state: query.data ? (query.data.state ?? initial.current) : null,
    update,
    pending: mutation.isPending,
    error: error || query.error?.message || "",
    clearError: () => setError(""),
    reload: query.refetch,
    loading: query.isLoading,
  };
}
