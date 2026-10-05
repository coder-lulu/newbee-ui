import type {
  ComponentRecordType,
  RouteRecordStringComponent,
} from "@vben/types";

export function normalizeComponentPath(component?: string) {
  if (!component) return "";
  const path = component
    .trim()
    .replace(/^\/*/, "")
    .replace(/^views\//, "")
    .replace(/\.vue$/i, "");
  return `/${path}`;
}

export function replaceMissingComponents(
  routes: RouteRecordStringComponent[],
  pageMap: ComponentRecordType,
  layoutMap: ComponentRecordType,
) {
  for (const route of routes) {
    if (route.component && typeof route.component === "string") {
      const component = route.component.trim();
      if (Object.hasOwn(layoutMap, component)) {
        route.component = component;
      } else {
        const normalized = normalizeComponentPath(component);
        route.component = pageMap[`../views${normalized}.vue`]
          ? normalized
          : "/_core/fallback/not-found";
      }
    }
    if (route.children?.length) {
      replaceMissingComponents(route.children, pageMap, layoutMap);
    }
  }
}

export function resolveBackendMenuPath(parentPath: string, path: string) {
  if (!parentPath || !path || path.startsWith("/")) return path;
  return `${parentPath.replace(/\/+$/, "")}/${path}`;
}
