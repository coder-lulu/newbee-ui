import type {
  ComponentRecordType,
  RouteRecordStringComponent,
} from "@vben/types";

import { describe, expect, it } from "vitest";

import {
  replaceMissingComponents,
  resolveBackendMenuPath,
} from "./route-components";

const pageMap: ComponentRecordType = {
  "../views/dashboard/workspace/index.vue": async () => ({}),
};
const layoutMap: ComponentRecordType = {
  BasicLayout: async () => ({}),
  IFrameView: async () => ({}),
  NotFoundComponent: async () => ({}),
};

describe("backend route components", () => {
  it("keeps the dashboard layout and its workspace page", () => {
    const routes: RouteRecordStringComponent[] = [
      {
        component: "BasicLayout",
        meta: { title: "Dashboard" },
        name: "Dashboard",
        path: "/",
        children: [
          {
            component: "/dashboard/workspace/index",
            meta: { title: "Workspace" },
            name: "Workspace",
            path: "/workspace",
          },
        ],
      },
    ];
    replaceMissingComponents(routes, pageMap, layoutMap);
    expect(routes[0]?.component).toBe("BasicLayout");
    expect(routes[0]?.children?.[0]?.component).toBe(
      "/dashboard/workspace/index",
    );
  });

  it("preserves mapped iframe and fallback components", () => {
    const routes = ["IFrameView", "NotFoundComponent"].map((component) => ({
      component,
      meta: { title: component },
      name: component,
      path: `/${component}`,
    }));
    replaceMissingComponents(routes, pageMap, layoutMap);
    expect(routes.map((route) => route.component)).toEqual([
      "IFrameView",
      "NotFoundComponent",
    ]);
  });

  it("normalizes existing views and keeps missing views on the 404 page", () => {
    const routes: RouteRecordStringComponent[] = [
      {
        component: "/views/dashboard/workspace/index.vue",
        meta: { title: "Workspace", hideInMenu: true },
        name: "Workspace",
        path: "/workspace",
      },
      {
        component: "/missing/index",
        meta: { title: "Missing", authority: ["admin"] },
        name: "Missing",
        path: "/missing",
      },
    ];
    replaceMissingComponents(routes, pageMap, layoutMap);
    expect(routes[0]?.component).toBe("/dashboard/workspace/index");
    expect(routes[0]?.meta?.hideInMenu).toBe(true);
    expect(routes[1]?.component).toBe("/_core/fallback/not-found");
    expect(routes[1]?.meta?.authority).toEqual(["admin"]);
  });
});

describe("backend menu paths", () => {
  it.each([
    ["/system", "user", "/system/user"],
    ["/cmdb", "cis", "/cmdb/cis"],
    ["/cmdb", "/cmdb/cis", "/cmdb/cis"],
    ["/io", "/io/input-task", "/io/input-task"],
    ["/io", "/io/config", "/io/config"],
    ["/io/config", "credentials", "/io/config/credentials"],
    ["/", "/workspace", "/workspace"],
    ["/", "workspace", "/workspace"],
    ["/system", "", ""],
    ["", "/system", "/system"],
  ])("resolves %s + %s to %s", (parent, path, expected) => {
    expect(resolveBackendMenuPath(parent, path)).toBe(expected);
  });
});
