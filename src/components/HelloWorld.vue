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

const calcAverage = () => {
  const arr = prices.value;
  average.value = arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

const format = price => {
  return (price ?? 0).toFixed(2);
};

const average = ref();
const prices = ref([]);

(() => {
  let idx = -1;
  const loop = async () => {
    setTimeout(loop, TIMEOUT / dataSources.length);
    idx = (idx + 1) % dataSources.length;
    try {
      const source = dataSources[idx];
      prices.value[idx] = source.pick(await get(source.url));
      calcAverage();
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
  <p>1 BTC = {{ format(average) }} USD</p>
  <p>Data Sources:</p>
  <ul>
    <li v-for="(val, i) in dataSources">
      {{ val.name }}: {{ format(prices[i]) }}
    </li>
  </ul>
</template>

<style scoped>
</style>
