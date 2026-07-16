import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

export function getRouter() {
  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
  });
}
