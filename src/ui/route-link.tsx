import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate, routeHash, type Route } from "./route";

/** A real link to a route. A plain click navigates in place; modified clicks keep the browser's behaviour. */
export function RouteLink({
  route,
  onClick,
  ...rest
}: { route: Route } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a
      {...rest}
      href={routeHash(route)}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        navigate(route);
      }}
    />
  );
}
