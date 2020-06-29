<template>
  <div id="home">Routing to the current week...</div>
</template>

<script>
import store from '../store'
export default {
  mounted: function () {
    this.$router.push('/list/' + store.computeWeekId())
  }
}
</script>
