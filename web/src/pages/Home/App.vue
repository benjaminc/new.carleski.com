<template>
  <div id="app">
    <div id="home">Routing to the current week...</div>
  </div>
</template>

<script>
import store from '../../store'
export default {
  mounted: function () {
    window.location = '/login?post_login_redirect_uri=/list/' + store.computeWeekId()
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
