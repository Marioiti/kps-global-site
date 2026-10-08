import "@testing-library/jest-dom";

// Tests marked `@vitest-environment node` have no window.
if (typeof window !== "undefined") {
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom has no IntersectionObserver; <Reveal> only needs the constructor and observe/disconnect.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IntersectionObserverStub });

// jsdom does not implement scrolling.
Object.defineProperty(window, "scrollTo", { writable: true, value: () => {} });
}

// React Router's data router builds a fetch Request on every navigation. Node's Request
// rejects jsdom's AbortSignal, so drop the signal in tests (browsers are unaffected).
const NodeRequest = globalThis.Request;
class JsdomCompatibleRequest extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const { signal: _signal, ...rest } = init ?? {};
    super(input, rest);
  }
}
Object.defineProperty(globalThis, "Request", { writable: true, value: JsdomCompatibleRequest });
