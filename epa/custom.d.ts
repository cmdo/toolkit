declare namespace svelte.JSX {
  interface DOMAttributes<T> {
    onfinalize?: CompositionEventHandler<T>;
  }
}
