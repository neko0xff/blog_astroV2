new PerformanceObserver(list => {
  const latestEntry = list.getEntries().at(-1);

  if (latestEntry?.element?.getAttribute("loading") == "lazy") {
    // eslint-disable-next-line no-console
    console.warn("Warning: LCP element was lazy loaded", latestEntry);
  }
}).observe({ type: "largest-contentful-paint", buffered: true });
