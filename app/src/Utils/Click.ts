import { router } from "../Router";

export const click = {
  /**
   * Handle click events and use the cmdo router if the target is in
   * the same domain.
   *
   * @param event - MouseEvent.
   */
  handle(event: MouseEvent): void {
    if (which(event) !== 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.defaultPrevented) {
      return;
    }

    // ### Find Anchor
    // Grab anchor from the event target or ignore the event.

    const a: HTMLAnchorElement | SVGAElement = <HTMLAnchorElement | SVGAElement>findAnchor(<Node>event.target);
    if (!a || !a.href) {
      return; // not a usable link ...
    }

    // ### SVG Check
    // If the link is inside svg, both href and target are always inside an object.

    const svg = typeof a.href === "object" && a.href.constructor.name === "SVGAnimatedString";
    const href = String(svg ? (<SVGAElement>a).href.baseVal : a.href);

    if (href === location.href) {
      if (!location.hash) {
        event.preventDefault();
      }
      return;
    }

    if (a.hasAttribute("download") || a.getAttribute("rel") === "external" || (svg ? (<SVGAElement>a).target.baseVal : a.target)) {
      return;
    }

    const url = new URL(href);

    // ### Dupe Check
    // If the path and search is the same as current route, ignore the event.

    if (url.pathname === location.pathname && url.search === location.search) {
      return;
    }

    // ### Route
    // If the origin is the same, route using router.

    if (url.origin === location.origin) {
      event.preventDefault();
      router.goTo(`${url.pathname}${url.search}`);
    }
  }
};

function which(event: MouseEvent) {
  return event.which === null ? event.button : event.which;
}

/**
 * Find anchor from provided node.
 *
 * @param node - Node to search.
 *
 * @returns Node.
 */
function findAnchor(node: Node) {
  while (node && node.nodeName.toUpperCase() !== "A") {
    node = node.parentNode; // SVG <a> elements have a lowercase name
  }
  return node;
}
