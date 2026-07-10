import { createFileRoute, redirect } from "@tanstack/react-router";

// Marketplace is disabled pending real one-time-purchase wiring.
// Keep the route registered but bounce visitors to /plans so no dead UI ships.
export const Route = createFileRoute("/marketplace")({
  beforeLoad: () => {
    throw redirect({ to: "/plans" });
  },
  component: () => null,
});
