<script setup>
import { ref } from 'vue';

const get = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const price = ref();

const fetchPrice = () => {
  get('https://blockchain.info/tobtc?currency=USD&value=1').then(res => {
    price.value = (1 / res).toFixed(2);
    console.log(price.value);
  }).finally(err => {
    setTimeout(fetchPrice, 15e3);
  });
};

fetchPrice();

</script>

<template>
  1 BTC = {{ price }} USD
</template>

<style scoped>
</style>
