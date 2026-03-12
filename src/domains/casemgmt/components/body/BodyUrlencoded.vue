<template>
  <div class="body-urlencoded">
    <urlencoded-table ref="tableRef" />
  </div>
</template>

<script setup>
import UrlencodedTable from '../UrlencodedTable.vue'

defineOptions({ name: 'BodyUrlencoded' })
</script>

<style scoped>
.body-urlencoded {
  width: 100%;
}
</style>
