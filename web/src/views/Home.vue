<template>
  <div id="home">Routing to the current week...</div>
</template>

<script>
import store from '../store'
export default {
  mounted: function () {
    window.location = '/login?post_login_redirect_uri=' + encodeURIComponent('/list/' + store.computeWeekId())
  }
}
</script>
