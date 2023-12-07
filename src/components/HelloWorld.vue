<script setup>
import { ref } from 'vue';

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
    url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSD',
    pick: res => +res.result[0].last_price,
    asset: 'USD',
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
  // {
  //   name: 'bitstamp',
  //   url: 'https://www.bitstamp.net/api/v2/ticker/btcusd',
  //   pick: res => +res.last,
  //   asset: 'USD',
  // },
  {
    name: 'coingecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    pick: res => +res.bitcoin.usd,
    asset: 'USD',
  },
];

const get = async (url) => {
  const response = await fetch(url);
  return await response.json();
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
  stdev.value = (filterPrices().reduce((sum, price) => {
    return sum + (av - price) ** 2;
  }, 0) / prices.length) ** 0.5;
};

const recalc = () => {
  calcAverage();
  calcStdev();
};

const format = price => {
  return (price ?? 0).toFixed(2);
};

const average = ref();
const prices = ref([]);
const stdev = ref();
const showSources = ref(true);

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
  <div class="box" @click="showSources = !showSources">
    <p class="average">1 BTC = <span class="nobr">{{ format(average) }} USD</span></p>
    <Transition>
      <div v-show="showSources">
        <p>Data Sources:</p>
        <ul>
          <li v-for="(val, i) in dataSources">
            {{ val.name }}: {{ format(prices[i]) }}
          </li>
        </ul>
        <p>Standard Deviation: {{ stdev }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.box {
  cursor: pointer;

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

</style>
