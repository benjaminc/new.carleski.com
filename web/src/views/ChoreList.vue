<template>
  <div class="listContainer">
      <div class="change-week">
        <div class="prev-week" v-if="state.currentWeekId > 2635"><router-link :to="prevWeekLink">&lt;&lt;&lt; Previous Week</router-link></div>
        <div class="next-week"><router-link :to="nextWeekLink">Next Week &gt;&gt;&gt;</router-link></div>
      </div>
      <div v-if="!state.currentWeek">Loading the current week...</div>
      <div v-else>
          <h1>Chores from {{startDate | formatDate}} to {{endDate | formatDate}}</h1>
          <div class="chore-list">
              <ChoreItem v-for="chore in state.currentWeek.chores" :key="chore.choreId" :chore="chore" :weekId="state.currentWeekId" />
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
      const weekId = parseInt(this.state.currentWeekId)
      if (!Number.isInteger(weekId)) return null
      const sunday = new Date((weekId - 0.5) * 7 * 24 * 60 * 60 * 1000)
      return new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate())
    },
    endDate: function () {
      const startDate = this.startDate
      return startDate ? new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000)) : null
    },
    nextWeekLink: function () {
      const weekId = parseInt(this.state.currentWeekId || this.state.homeWeekId) + 1
      return parseInt(this.state.homeWeekId) !== weekId ? '/list/' + weekId : '/'
    },
    prevWeekLink: function () {
      const weekId = parseInt(this.state.currentWeekId || this.state.homeWeekId) - 1
      return parseInt(this.state.homeWeekId) !== weekId ? '/list/' + weekId : '/'
    }
  },
  filters: {
    formatDate: function (dt) {
      if (!dt) return ''
      const m = dt.getMonth() + 1
      const d = dt.getDate()
      return (m < 10 ? '0' : '') + m + '/' + (d < 10 ? '0' : '') + d + '/' + dt.getFullYear()
    }
  },
  methods: {
    loadWeek: function () {
      store.setWeek(this.$route.params.weekId)
    }
  },
  watch: {
    $route: function (to, from) {
      this.loadWeek()
    }
  },
  created: async function () {
    if (!(await store.verifyUser())) window.location = '/login'
  },
  mounted: function () {
    this.loadWeek()
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

.change-week {
  width: 100%;
  height: 12px;
  font-size: 0.8em;
  margin: 20px 0;
  position: relative;
}

.prev-week, .next-week {
  position: absolute;
}
.prev-week {
  left: 0;
}
.next-week {
  right: 0;
}
</style>
