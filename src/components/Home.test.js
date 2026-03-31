import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Home from './Home.vue';

// Mock responses based on the data sources defined in Home.vue
const mockResponses = {
  'https://blockchain.info/tobtc?currency=USD&value=1': 1 / 50000, // pick: res => 1 / +res
  'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT': { price: '51000' }, // pick: res => +res.price
  'https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT': { result: { list: [{ lastPrice: '52000' }] } }, // pick: res => +res.result.list[0].lastPrice
  'https://api.coinbase.com/v2/prices/spot?currency=USD': { data: { amount: '53000' } }, // pick: res => +res.data.amount
  'https://api.kraken.com/0/public/Ticker?pair=XXBTZUSD': { result: { XXBTZUSD: { a: ['54000'] } } }, // pick: res => +res.result.XXBTZUSD.a[0]
  'https://www.bitstamp.net/api/v2/ticker/btcusd': { last: '55000' }, // pick: res => +res.last
  'https://api.mexc.com/api/v3/ticker/price?symbol=BTCUSDT': { price: '56000' }, // pick: res => +res.price
  'https://api.gemini.com/v1/pubticker/btcusd': { last: '57000' }, // pick: res => +res.last
};

describe('Home.vue', () => {
  let originalFetch;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock navigator.vibrate
    if (!global.navigator) {
      global.navigator = {};
    }
    global.navigator.vibrate = vi.fn();

    originalFetch = global.fetch;
    global.fetch = vi.fn(async (url) => {
      // Return a successful response for our mocked endpoints
      if (mockResponses[url]) {
        return {
          ok: true,
          json: async () => mockResponses[url],
        };
      }
      // Simulate fallback for the proxy URL
      if (url.startsWith('https://cors-proxy.7u.pl/?url=')) {
        const originalUrl = decodeURIComponent(url.split('url=')[1]);
        if (mockResponses[originalUrl]) {
           return {
             ok: true,
             json: async () => mockResponses[originalUrl],
           };
        }
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({}),
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('renders correctly and fetches data sources', async () => {
    const wrapper = mount(Home);

    // The initial render has average undefined and shows 'Data Sources:'
    expect(wrapper.text()).toContain('1 BTC =');
    expect(wrapper.text()).toContain('Data Sources:');

    // Run all timers to complete the initial data fetching loop for all 8 sources
    // TIMEOUT is 15000. For fast loading, timeout is 0.
    // We can just run all timers to clear the queue.
    for(let i=0; i<8; i++) {
        await vi.runOnlyPendingTimersAsync();
    }

    // We need to await the promises resolving inside loop()
    await new Promise(resolve => process.nextTick(resolve));

    // After fetching, we should see the prices in the DOM
    // For example, binance is 51000
    expect(wrapper.text()).toContain('51000.00');
    // blockchain.info is 50000
    expect(wrapper.text()).toContain('50000.00');

    // Calculate average of 50k, 51k, 52k, 53k, 54k, 55k, 56k, 57k
    // Sum = 428000
    // Avg = 53500
    expect(wrapper.text()).toContain('53 500 USD');
  });

  it('toggles visibility of data sources on click and vibrates', async () => {
    const wrapper = mount(Home);

    // Initially, showSources is true so dataSourcesEl is visible
    // v-show="showSources" means it has display: none when false.
    // However, @vue/test-utils `isVisible()` is the best way to check
    const sourcesDiv = wrapper.find('.box > div'); // The div with v-show is the second child of .box
    // It's inside a transition

    expect(wrapper.find('.vert-margin').isVisible()).toBe(true);

    // Click the box
    await wrapper.find('.box').trigger('click');

    // Expect vibrate to be called
    expect(global.navigator.vibrate).toHaveBeenCalledWith([30, 20, 20]);

    // Since it's a v-show, the element is still in the DOM but with display: none
    const transitionDiv = wrapper.findComponent({ name: 'Transition' }).find('div');
    expect(transitionDiv.element.style.display).toBe('none');

    // Click again to show
    await wrapper.find('.box').trigger('click');
    expect(transitionDiv.element.style.display).not.toBe('none');
  });

  it('falls back to proxy on fetch failure', async () => {
    // Override fetch to fail on the first attempt
    const originalFetchMock = global.fetch;
    global.fetch = vi.fn(async (url) => {
      if (!url.startsWith('https://cors-proxy.7u.pl/')) {
        return {
          ok: false,
          status: 500
        };
      }
      return originalFetchMock(url);
    });

    // Suppress console.warn for the test output
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const wrapper = mount(Home);

    // Run timers to trigger the first fetch
    await vi.runOnlyPendingTimersAsync();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Fetch failed for https://blockchain.info/tobtc?currency=USD&value=1, falling back to proxy...'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
