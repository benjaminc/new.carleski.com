<template>
  <div class="listContainer">
      <div v-if="!state.currentWeek">Loading the current week...</div>
      <div v-else>
          <h1>Chores for the week from {{startDate | formatDate}} to {{endDate | formatDate}}</h1>
          <div class="chore-list">
              <ChoreItem v-for="chore in state.currentWeek.chores" :key="chore.choreId" :chore="chore" :weekId="$route.params.weekId" />
          </div>
      </div>
  </div>
</template>

<script>
import store from '../store'
import ChoreItem from '../components/ChoreItem'
export default {
  components: { ChoreItem },
  data: function () {
    return {
      state: store.state
    }
  },
  computed: {
    startDate: function () {
      const weekId = parseInt(this.$route.params.weekId)
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
      if (this.$route.params.weekId) await store.setWeek(this.$route.params.weekId)
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

<style scoped>
.listContainer {
    width: 90%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
}
</style>
