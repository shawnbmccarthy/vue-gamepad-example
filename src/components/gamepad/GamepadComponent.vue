<template>
  <div id="gamepad">
    <PageOneComponent v-if="currentPage === 'one'" :move="currentEngineMove" :ptz="currentPtzMove"/>
    <PageTwoComponent v-if="currentPage === 'two'" :move="currentEngineMove" :ptz="currentPtzMove"/>
    <PageThreeComponent v-if="currentPage === 'three'" :move="currentEngineMove" :ptz="currentPtzMove"/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import PageOneComponent from '@/components/gamepad/PageOneComponent.vue'
import PageTwoComponent from '@/components/gamepad/PageTwoComponent.vue'
import PageThreeComponent from '@/components/gamepad/PageThreeComponent.vue'

let gamepad: Gamepad
const page = ref('one')
const engineMove = ref('stop')
const ptzMove = ref('stop')

const controls = ref({
  rightAxis: [0.0, 0.0],
  leftAxis: [0.0, 0.0],
  pageButtons: [1, 0, 0]
})

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const controllerLoop = async () => {
  while (gamepad.connected) {
    const pageButtons: Array<GamepadButton> = gamepad.buttons.slice(0, 3)
    const la: Array<number> = gamepad.axes.slice(0, 2)
    const ra: Array<number> = gamepad.axes.slice(3, 5)
    la.forEach((value: number, idx: number) => {
      if (Math.abs(value) - 0.99 > 0) {
        controls.value.leftAxis[idx] = value
      } else {
        controls.value.leftAxis[idx] = 0
      }
    })
    ra.forEach((value: number, idx: number) => {
      if (Math.abs(value) - 0.20 > 0) {
        // TODO: figure out drive movement
        controls.value.rightAxis[idx] = value
      } else {
        controls.value.rightAxis[idx] = 0
      }
    })
    pageButtons.forEach((button: GamepadButton, idx: number) => {
      controls.value.pageButtons[idx] = button.value
    })
    await delay(2000)
  }
}

/*
 * watch buttons
 */
watch(controls.value.pageButtons, newVal => {
  console.log(`PB -> ${new Date()}`)
  controls.value.pageButtons = newVal
}, { deep: true })

watch(controls.value.rightAxis, newVal => {
  console.log(`RA -> ${new Date()}`)
  controls.value.rightAxis = newVal
}, { deep: true })

watch(controls.value.leftAxis, newVal => {
  console.log(`LA -> ${new Date()}`)
  controls.value.leftAxis = newVal
}, { deep: true })

const currentPage = computed(() => {
  let idxStr = page.value
  controls.value.pageButtons.forEach((item, idx) => {
    if (item === 1) {
      if (idx === 0) {
        idxStr = 'one'
      } else if (idx === 1) {
        idxStr = 'two'
      } else if (idx === 2) {
        idxStr = 'three'
      }
    }
  })
  return idxStr
})

/*
 * TODO: Determine when to stop
 */
const currentPtzMove = computed(() => {
  let pm = ptzMove.value
  controls.value.leftAxis.forEach((value, idx) => {
    if (idx === 0) {
      if (value < 0) {
        pm = 'PAN RIGHT'
      } else if (value > 0) {
        pm = 'PAN LEFT'
      }
    } else if (idx === 1) {
      if (value < 0) {
        pm = 'TILT UP'
      } else if (value > 0) {
        pm = 'TILT DOWN'
      }
    }
  })
  return pm
})

/*
 * TODO: Determine when to stop
 */
const currentEngineMove = computed(() => {
  let em = engineMove.value
  let turn = ''
  const direction = controls.value.rightAxis[1]
  const steering = controls.value.rightAxis[0]
  console.log(`direction: ${direction}, steering: ${steering}`)
  if (direction > 0) {
    em = 'backward'
  } else if (direction < 0) {
    em = 'forward'
  }
  if (steering > 0) {
    turn = 'left'
  } else if (steering < 0) {
    turn = 'right'
  }
  if (em === 'stop' && turn !== '') {
    em = 'pivot'
  }
  return em + ' ' + turn
})

onMounted(() => {
  window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
    // our control will only support the one gamepad
    gamepad = e.gamepad
    console.log('gamepad connected')
    controllerLoop()
  })

  window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
    console.warn(`gamepad disconnected: ${e.gamepad.id}`)
  })
})
</script>
