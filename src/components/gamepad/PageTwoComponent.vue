<template>
  <div id="page_two">
    <h3>Page Two</h3>
    <div>
      <h4>{{props.move}}</h4>
      <h4>{{props.ptz}}</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  move: string
  ptz: string
}

const props = defineProps<Props>()
</script>
