import { router } from "../Router";
import E401 from "../Views/Errors/401.svelte";
import E404 from "../Views/Errors/404.svelte";
import E500 from "../Views/Errors/500.svelte";
import E503 from "../Views/Errors/503.svelte";

export function addRouteListener(onChange: (component: any) => void): void {
  router.listen({
    render: async (components) => {
      onChange(components[0]);
    },
    error: (error) => {
      switch (error.type) {
        case "RenderActionMissingError": {
          console.log(error);
          onChange(E500);
          break;
        }
        case "ActionRejectedError": {
          console.log(error);
          switch (error.details.status) {
            case 401: {
              onChange(E401);
              break;
            }
            case 503: {
              onChange(E503);
              break;
            }
            default: {
              onChange(E500);
              break;
            }
          }
          break;
        }
        case "RouteNotFoundError": {
          console.log(error);
          onChange(E404);
          break;
        }
      }
    }
  });
  goToInitialRoute();
}

function goToInitialRoute(): void {
  const { pathname, search, state } = router.location;
  router.goTo(`${pathname}${search}`, state);
}
