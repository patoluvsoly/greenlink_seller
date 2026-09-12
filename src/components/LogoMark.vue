<script setup>
defineProps({
  size: { type: Number, default: 40 },
})
</script>

<template>
  <svg
    class="gl-logo-mark"
    :width="size"
    :height="Math.round((size * 58) / 82)"
    viewBox="0 0 82 58"
    role="img"
    aria-label="GreenLink"
  >
    <circle class="gl-logo-ring-a" cx="28" cy="29" r="24" />
    <circle class="gl-logo-ring-b" cx="54" cy="29" r="24" />
  </svg>
</template>

<style scoped>
.gl-logo-ring-a {
  fill: none;
  stroke: var(--gl-forest-950);
  stroke-width: 7;
}
.gl-logo-ring-b {
  fill: none;
  stroke: var(--gl-gold-500);
  stroke-width: 7;
}
</style>