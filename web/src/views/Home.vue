<template>
  <div id="home">Routing to the current week...</div>
</template>

<script>
import store from '../store'
export default {
  mounted: async function () {
    const response = await fetch('/.auth/me')
    const payload = await response.json()
    if (!payload) window.location = '/login'
    else this.$router.push('/list/' + store.computeWeekId())
  }
}
</script>
