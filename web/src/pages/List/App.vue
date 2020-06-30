<template>
  <div id="app">
    <div class="listContainer">
        <div v-if="!week">Loading the current week...</div>
        <div v-else>
            <h1>Chores for the week from {{startDate | formatDate}} to {{endDate | formatDate}}</h1>
            <div class="chore-list">
                <ChoreItem v-for="chore in state.currentWeek.chores" :key="chore.choreId" :chore="chore" :weekId="$route.params.weekId" />
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import store from '../../store'
import ChoreItem from '../../components/ChoreItem'
export default {
  components: { ChoreItem },
  data: function () {
    const paths = window.location.pathname.split(/\//g)
    const weekId = paths.length > 0 && Number.isInteger(parseInt(paths[paths.length - 1])) ? parseInt(paths[paths.length - 1]) : null
    return {
      weekId,
      state: store.state
    }
  },
  computed: {
    startDate: function () {
      const weekId = parseInt(this.weekId)
      if (!Number.isInteger(weekId)) return null
      const sunday = new Date((weekId - 0.5) * 7 * 24 * 60 * 60 * 1000)
      return new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate())
    },
    endDate: function () {
      const startDate = this.startDate
      return new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000))
    }
  },
  filters: {
    formatDate: function (dt) {
      const m = dt.getMonth() + 1
      const d = dt.getDate()
      return (m < 10 ? '0' : '') + m + '/' + (d < 10 ? '0' : '') + d + '/' + dt.getFullYear()
    }
  },
  methods: {
    loadWeek: async function () {
      if (this.weekId) await store.setWeek(this.weekId)
    }
  },
  watch: {
    $route: async function (to, from) {
      await this.loadWeek()
    }
  },
  mounted: async function () {
    await this.loadWeek()
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

.listContainer {
    width: 90%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
}
</style>
