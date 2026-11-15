import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    basepath: "/academic-mobility",
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
```[cite: 15]

*Проверка:* параметр `basepath: "/academic-mobility"` передан в объект настроек внутри `createRouter({ ... })` (без слэша на конце)[cite: 15].
