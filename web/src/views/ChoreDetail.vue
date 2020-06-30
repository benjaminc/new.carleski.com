<template>
     <div class="detail-item">
        <div class="return">
            <router-link :to="'/list/' + $route.params.weekId">
                <ChevronLeft />
                <div>Return to chores list</div>
            </router-link>
        </div>
        <div v-if="!chore">Loading the chore...</div>
        <div v-else>
            <h1>{{chore.name}} for the week from {{startDate | formatDate}} to {{endDate | formatDate}}</h1>
            <div class="attribute-list">
                <div class="attribute-item">
                    <div class="header">Assigned To:</div>
                    <div class="simple-detail">{{chore.assignedTo}}</div>
                </div>
                <div class="attribute-item">
                    <div class="header">Status:</div>
                    <div class="simple-detail">{{chore.complete ? 'Passed Off' : 'Not Passed Off'}}</div>
                </div>
                <Schedule :chore="chore" :schedule="schedule" v-for="schedule in chore.schedules" :key="schedule.alias" />
                <History :history="chore.history" />
            </div>
        </div>
    </div>
</template>

<script>
import ChevronLeft from '../assets/chevron-left.svg'
import Schedule from '../components/Schedule'
import History from '../components/History'
import store from '../store'
export default {
  components: { ChevronLeft, Schedule, History },
  data: function () {
    return {
      chore: null
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
      const choreId = this.$route.params.choreId
      const week = this.$route.params.weekId ? await store.setWeek(this.$route.params.weekId) : null
      const chores = week && week.chores
      if (chores && chores.length && choreId) {
        for (let i = 0; i < chores.length; i++) {
          if (chores[i].choreId === choreId) {
            this.chore = chores[i]
            break
          }
        }
      }
    }
  },
  watch: {
    $route: async function (to, from) {
      await this.loadWeek()
    }
  },
  created: async function () {
    if (!(await store.verifyUser())) window.location = '/login'
  },
  mounted: async function () {
    await this.loadWeek()
  }
}
</script>

<style scoped>
.detail-item {
    width: 90%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
}
.return {
    height: 36px;
    margin-bottom: 20px;
    font-size: 20px;
    text-align: left;
}
.return div {
    display: inline-block;
    position: relative;
    top: -4px;
    color: #aaa;
}
.return svg {
    height: 24px;
    width: 24px;
    color: #aaa;
}
.attribute-item {
    display:block;
    position:relative;
    padding: 20px 5px;
    box-shadow:0 2px 0 -1px #ebebeb;
    text-align: left;
}
.attribute-item .header {
    display: inline-block;
    width: 150px;
    text-align: right;
    font-weight: bold;
    padding-right: 15px;
}
.attribute-item .simple-detail {
    display: inline-block;
    text-align: left;
}
</style>
