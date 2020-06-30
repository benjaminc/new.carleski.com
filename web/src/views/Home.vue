<template>
  <div id="home">Routing to the current week...</div>
</template>

<script>
import store from '../store'
export default {
  created: async function () {
    if (!(await store.verifyUser())) window.location = '/login'
  },
  mounted: async function () {
    this.$router.push('/list/' + store.computeWeekId())
  }
}
</script>
