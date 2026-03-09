import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("/login", "routes/login.tsx"),
  route("/setup", "routes/setup.tsx"),
  route("/monitorStats/:monitor_id", "routes/monitorStats.ts"),
] satisfies RouteConfig;
