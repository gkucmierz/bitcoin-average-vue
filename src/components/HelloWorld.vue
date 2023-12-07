<script setup>
import { ref } from 'vue';

const TIMEOUT = 15e3;

const dataSources = [
  {
    name: 'blockchain.info',
    url: 'https://blockchain.info/tobtc?currency=USD&value=1',
    pick: res => 1 / +res,
  },
  {
    name: 'binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    pick: res => +res.price,
  },
];

const get = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const calcAverage = () => {
  const arr = prices.value;
  console.log(arr);
  average.value = arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

const format = price => {
  return (price ?? 0).toFixed(2);
};

const average = ref();
const prices = ref([]);

(() => {
  let idx = -1;
  const loop = () => {
    idx = (idx + 1) % dataSources.length;
    const source = dataSources[idx];
    get(source.url).then(res => {
      prices.value[idx] = source.pick(res);
    }).then(calcAverage);
    setTimeout(loop, TIMEOUT / dataSources.length);
  };
  loop();
})();

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
