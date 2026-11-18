import { Clock3, Globe, Menu as MenuIcon, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { allSteps } from "../lib/flow";
import type { AppState } from "../lib/model";
import { dateInZone } from "../lib/schedule";
import {
  finishSession,
  heartbeatSession,
  recoverSession,
} from "../lib/sessions";
import { StudyCtx, ignore, type StudyContext } from "./context";
import { useFlow } from "./data";
import { SettingsModal, TimeForm, type Update } from "./forms";
import { Home } from "./home";
import { Brand, Login } from "./login";
import { Popover } from "./popover";
import { PublicPageDialog } from "./public-page";
import { RecallScreen } from "./recall";
import { navigate, parseRoute, routeHash, useHash, type Route } from "./route";
import { SearchModal } from "./search";
import { SessionScreen } from "./session";
import { api, useAuth, useStudyStore } from "./store";
import { WeekSheet } from "./week-sheet";
import "./study.css";
import "./session.css";

export function StudyApp() {
  const auth = useAuth();
  const store = useStudyStore(auth.data?.authenticated === true);
  if (auth.isLoading)
    return (
      <div className="app-loading">
        <Brand />
        <div className="loading-line" />
        <p>Opening your study space…</p>
      </div>
    );
  if (!auth.data?.authenticated)
    return (
      <Login
        development={auth.data?.development ?? false}
        configured={auth.data?.configured ?? false}
        failure={auth.error?.message}
      />
    );
  if (!store.state)
    return (
      <div className="app-loading">
        <Brand />
        <p>{store.error || "Getting your plan ready…"}</p>
        {store.error && (
          <button
            className="button secondary"
            type="button"
            onClick={() => void store.reload()}
          >
            Try again
          </button>
        )}
      </div>
    );
  return (
    <Workspace
      state={store.state}
      update={store.update}
      error={store.error}
      onLogout={async () => {
        await api("/api/auth/logout", {});
        window.location.assign("/");
      }}
    />
  );
}

type Dialog = "settings" | "search" | "public" | "time" | null;

function Workspace({
  state,
  update,
  error,
  onLogout,
}: {
  state: AppState;
  update: Update;
  error: string;
  onLogout: () => void;
}) {
  const flow = useFlow();
  const hash = useHash();
  const route = useMemo(() => parseRoute(hash), [hash]);
  const [now, setNow] = useState(() => new Date());
  const [dialog, setDialog] = useState<Dialog>(null);
  const today = dateInZone(now, state.settings.timezone);
  const active = state.sessions.find(
    (session) => session.id === state.activeSessionId,
  );
  const running = active?.status === "running";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (route.name === "home" && hash !== "" && hash !== routeHash(route))
      window.location.replace(routeHash(route));
  }, [hash]);
  const previousRoute = useRef(route.name);
  useEffect(() => {
    const left =
      previousRoute.current === "session" && route.name !== "session";
    previousRoute.current = route.name;
    if (!left) return;
    void update((s) => {
      const open = s.sessions.find((item) => item.id === s.activeSessionId);
      return open &&
        open.status !== "finished" &&
        s.sessionRecoveryId !== open.id
        ? finishSession(s, new Date())
        : s;
    }).catch(ignore);
  }, [route.name]);
  useEffect(() => {
    const stale = state.sessions.some(
      (session) =>
        session.status === "running" &&
        Date.now() - Date.parse(session.lastHeartbeatAt) > 120_000,
    );
    if (stale) void update((s) => recoverSession(s, new Date())).catch(ignore);
  }, [state.activeSessionId, active?.status]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => void update((s) => heartbeatSession(s, new Date())).catch(ignore),
      30_000,
    );
    return () => clearInterval(timer);
  }, [active?.id, running]);

  if (flow.isPending || flow.isError)
    return (
      <div className="app-loading">
        <Brand />
        {flow.isError ? (
          <>
            <p>The course plan could not be loaded.</p>
            <button
              className="button secondary"
              type="button"
              onClick={() => void flow.refetch()}
            >
              Try again
            </button>
          </>
        ) : (
          <p>Loading the course…</p>
        )}
      </div>
    );

  const context: StudyContext = { state, update, flow: flow.data, today };
  const fullScreen = route.name === "session" || route.name === "recall";
  const recovering = state.sessions.find(
    (session) => session.id === state.sessionRecoveryId,
  );

  return (
    <StudyCtx.Provider value={context}>
      <div className={fullScreen ? "focus-shell" : "shell"}>
        {!fullScreen && (
          <header className="shell-header">
            <Brand />
            <nav className="shell-actions" aria-label="Main">
              <button
                type="button"
                className="nav-link"
                aria-label="Search the course"
                onClick={() => setDialog("search")}
              >
                <Search size={18} aria-hidden />
                <span className="nav-label" aria-hidden>
                  Search
                </span>
              </button>
              <button
                type="button"
                className="nav-link"
                onClick={() => setDialog("public")}
              >
                <Globe size={18} aria-hidden />
                <span className="nav-label">Public page</span>
              </button>
              <AppMenu
                onSettings={() => setDialog("settings")}
                onLogout={onLogout}
              />
            </nav>
          </header>
        )}
        {error && (
          <div className="banner" role="alert">
            {error} Your saved progress is safe. Try the change again.
          </div>
        )}
        {!fullScreen && recovering && (
          <div className="banner recovery">
            <Clock3 size={16} aria-hidden />
            <p>
              Your last session stopped checking in. We paused it at the last
              saved moment.
            </p>
            <button
              className="button secondary small"
              type="button"
              onClick={() =>
                void update((s) => ({ ...s, sessionRecoveryId: null })).catch(
                  ignore,
                )
              }
            >
              Keep recorded time
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => setDialog("time")}
            >
              Correct time
            </button>
          </div>
        )}
        <Screen route={route} onSearch={() => setDialog("search")} />
      </div>
      {dialog === "settings" && (
        <SettingsModal
          state={state}
          update={update}
          onClose={() => setDialog(null)}
          onLogout={onLogout}
        />
      )}
      {dialog === "search" && <SearchModal onClose={() => setDialog(null)} />}
      {dialog === "public" && (
        <PublicPageDialog onClose={() => setDialog(null)} />
      )}
      {route.name === "home" && <WeekSheet unitId={route.unitId} />}
      {dialog === "time" && recovering && (
        <TimeForm
          state={state}
          tasks={allSteps(flow.data)}
          taskId={recovering.taskId}
          editing={recovering}
          update={update}
          onClose={() => setDialog(null)}
        />
      )}
    </StudyCtx.Provider>
  );
}

function Screen({ route, onSearch }: { route: Route; onSearch: () => void }) {
  switch (route.name) {
    case "home":
      return (
        <main className="page">
          <Home />
        </main>
      );
    case "recall":
      return <RecallScreen onSearch={onSearch} />;
    case "session":
      return <SessionScreen stepId={route.stepId} onSearch={onSearch} />;
  }
}

function AppMenu({
  onSettings,
  onLogout,
}: {
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <Popover
      label="Menu"
      triggerClassName="nav-link nav-icon"
      trigger={<MenuIcon size={18} aria-hidden />}
    >
      {(close) => (
        <ul className="menu-list">
          <li>
            <button
              type="button"
              onClick={() => {
                close();
                onSettings();
              }}
            >
              Settings
            </button>
          </li>
          <li>
            <button type="button" onClick={onLogout}>
              Sign out
            </button>
          </li>
        </ul>
      )}
    </Popover>
  );
}
