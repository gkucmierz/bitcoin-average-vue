<script setup>
import { ref, onMounted } from 'vue';
import { format } from '../utils/format';

const TIMEOUT = 15e3;

const dataSources = [
  {
    name: 'blockchain.info',
    url: 'https://blockchain.info/tobtc?currency=USD&value=1',
    pick: res => 1 / +res,
    asset: 'USD',
  },
  {
    name: 'binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    pick: res => +res.price,
    asset: 'USDT',
  },
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT',
    pick: res => +res.result.list[0].lastPrice,
    asset: 'USDT',
  },
  {
    name: 'coinbase',
    url: 'https://api.coinbase.com/v2/prices/spot?currency=USD',
    pick: res => +res.data.amount,
    asset: 'USD',
  },
  {
    name: 'kraken',
    url: 'https://api.kraken.com/0/public/Ticker?pair=XXBTZUSD',
    pick: res => +res.result.XXBTZUSD.a[0],
    asset: 'USD',
  },
  {
    name: 'bitstamp',
    url: 'https://www.bitstamp.net/api/v2/ticker/btcusd',
    pick: res => +res.last,
    asset: 'USD',
  },
  {
    name: 'mexc',
    url: 'https://api.mexc.com/api/v3/ticker/price?symbol=BTCUSDT',
    pick: res => +res.price,
    asset: 'USDT',
  },
  {
    name: 'gemini',
    url: 'https://api.gemini.com/v1/pubticker/btcusd',
    pick: res => +res.last,
    asset: 'USD',
  },
];

const get = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`Fetch failed for ${url}, falling back to proxy...`, err);
    const proxyUrl = `https://cors-proxy.7u.pl/?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    return await response.json();
  }
};

const filterPrices = () => {
  return prices.value.filter(val => {
    return typeof val === 'number';
  });
};

const calcAverage = () => {
  const prices = filterPrices();
  average.value = prices.reduce((sum, val) => sum + val, 0) / prices.length;
};

const calcStdev = () => {
  const av = average.value;
  const prices = filterPrices();
  stdev.value = (prices.reduce((sum, price) => {
    return sum + (av - price) ** 2;
  }, 0) / prices.length) ** 0.5;
};

const recalc = () => {
  calcAverage();
  calcStdev();
};

const vibrate = () => {
  navigator?.vibrate([30,20,20]);
};

const dataSourcesEl = ref(null);
const dataSourcesHeight = ref('100%');
const average = ref();
const prices = ref([]);
const stdev = ref();
const showSources = ref(true);

onMounted(() => {
  dataSourcesHeight.value = `${dataSourcesEl.value.offsetHeight}px`;
});

(() => {
  let idx = -1;
  const loop = async () => {
    const fast = prices.value.length < dataSources.length;
    setTimeout(loop, fast ? 0 : TIMEOUT / dataSources.length);
    idx = (idx + 1) % dataSources.length;
    try {
      const source = dataSources[idx];
      prices.value[idx] = null;
      prices.value[idx] = source.pick(await get(source.url));
      recalc();
    } catch (e) {};
  };
  loop();
})();

// get(`
// `.trim()).then(res => {
//   console.log(res);
// });

</script>

<template>
  <div class="box" @click="showSources = !showSources; vibrate()">
    <p class="average"><span class="nobr">1 BTC</span> = <span class="nobr">{{ format(average, 0, true) }} USD</span></p>
    <Transition>
      <div v-show="showSources" ref="dataSourcesEl">
        <p class="vert-margin">Data Sources:</p>
        <ul>
          <li v-for="(val, i) in dataSources">
            <div class="li-name">{{ val.name }}:</div>
            <div class="li-price">{{ format(prices[i]) }}</div>
          </li>
        </ul>
        <p class="vert-margin">St. Deviation: {{ format(stdev) }} ({{ format(stdev/average*100, 4) }}%)</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  overflow: hidden;
  transition: all 80ms ease-in-out;
  height: v-bind(dataSourcesHeight);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  height: 0;
}

.box {
/*  cursor: pointer;*/

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);

  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);

  color: #333;
  padding: 32px;
}

.average {
  text-align: center;
  font-size: 3em;
}

.nobr {
  white-space: nowrap;
}

.box ul li {
  display: flex;
  flex-basis: 0;
  overflow: hidden;
}
.box ul li div {
  flex-basis: 0;
  padding: 0 4px;
}
.li-name {
  color: rgba(0, 0, 0, 0.5);
  text-align: right;
  flex-grow: 7;
}
.li-price {
  text-align: left;
  flex-grow: 5;
}
.vert-margin {
  margin: 8px 0;
}

</style>
