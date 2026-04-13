import '@testing-library/jest-dom';

/**
 * ResizeObserver mock for Recharts' ResponsiveContainer.
 *
 * The real ResizeObserver fires its callback with a contentRect containing
 * the element's measured dimensions. In jsdom every element has 0×0 size,
 * so Recharts logs "width(0) and height(0) of chart should be greater than 0"
 * for every test that mounts a chart.
 *
 * This mock immediately calls the callback with a fixed 800×400 contentRect
 * on observe(), which satisfies Recharts' size guard and silences the warning.
 */
class ResizeObserverMock {
  constructor(callback) {
    this._callback = callback;
  }

  observe(target) {
    this._callback([
      {
        contentRect: { width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400 },
        target,
      },
    ]);
  }

  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
