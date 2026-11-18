import { createFileRoute } from "@tanstack/react-router";
import { VerifyLink } from "../ui/login";
export const Route = createFileRoute("/auth/verify")({ component: VerifyLink });
