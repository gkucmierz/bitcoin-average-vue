<script setup>
import { ref, onMounted } from 'vue';
import Home from './components/Home.vue';
import Trianglify from 'trianglify/dist/trianglify.bundle.js';

const roundStep = 200;
const round = size => Math.ceil(size / roundStep) * roundStep;

const background = ref(null);
const width = ref(round(window.innerWidth));
const height = ref(round(window.innerHeight));

const updateBackground = () => {
  const pattern = Trianglify({
    width: width.value,
    height: height.value,
  });
  background.value.textContent = '';
  background.value.appendChild(pattern.toSVG());
}

onMounted(updateBackground);

window.addEventListener('resize', event => {
  const newWidth = round(event.target.innerWidth);
  const newHeight = round(event.target.innerHeight);
  if (newWidth === width.value && newHeight === height.value) return;
  width.value = newWidth;
  height.value = newHeight;
  updateBackground();
});

</script>

<template>
  <div ref="background" class="background"></div>
  <Home/>
</template>

<style scoped>
.background {
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}
.background svg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>
