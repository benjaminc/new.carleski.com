<template>
  <div id="home">Routing to the current week...</div>
</template>

<script>
import store from '../store'
export default {
  mounted: async function () {
    const response = await fetch('/.auth/me')
    if (response.status === 200) {
      const payload = await response.json()
      if (payload && payload.clientPrincipal) this.$router.push('/list/' + store.computeWeekId())
      else window.location = '/login'
    } else window.location = '/login'
  }
}
</script>
