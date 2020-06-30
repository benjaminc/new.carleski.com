<template>
  <div id="app">
     <div class="detail-item">
        <div class="return">
            <a :href="'/list/' + weekId">
                <ChevronLeft />
                <div>Return to chores list</div>
            </a>
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
                <div class="schedule" v-for="schedule in chore.schedules" :key="schedule.alias">
                    <div class="header">{{schedule.name}}</div>
                    <div class="tasks">
                        <ol>
                            <li class="task" v-for="task in schedule.tasks" :key="task.name">
                                <div class="header">
                                    <a @click.prevent.stop="toggleTask(schedule, task)" v-if="task.exampleUrl || task.imageUrls.length">
                                        {{task.name}}
                                        <QuestionCircle v-if="task.exampleUrl" />
                                        <Images v-if="task.imageUrls.length" />
                                    </a>
                                    <span v-else>{{task.name}}</span>
                                </div>
                                <div class="details" v-show="selectedSchedule === schedule.alias && selectedTask === task.name">
                                    <div class="example" v-if="task.exampleUrl">
                                        <div class="header">Example</div>
                                        <img :src="task.exampleUrl" />
                                    </div>
                                    <div class="uploads" v-if="task.imageUrls.length">
                                        <div class="header">Uploaded Images</div>
                                        <div class="image" v-for="img in task.imageUrls" :key="img.url">
                                            <div class="header">By {{img.by}} at {{img.at}}</div>
                                            <img :src="img.url" />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
                <div class="history-items" v-if="chore.history.length">
                    <div class="header">Historical Actions</div>
                    <div class="history-item" v-for="item in chore.history" :key="item.at">{{item.complete ? 'Completed' : 'Uncompleted'}} at {{item.at}} by {{item.by}}</div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import ChevronLeft from '../../assets/chevron-left.svg'
import Images from '../../assets/images.svg'
import QuestionCircle from '../../assets/question-circle.svg'
import store from '../../store'
export default {
  components: { ChevronLeft, Images, QuestionCircle },
  data: function () {
    const paths = window.location.pathname.split(/\//g)
    const choreId = paths.length > 0 ? paths[paths.length - 1] : null
    const weekId = paths.length > 1 ? paths[paths.length - 2] : null
    return {
      choreId,
      weekId,
      state: store.state,
      chore: null,
      selectedSchedule: null,
      selectedTask: null
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
    toggleTask: function (schedule, task) {
      if (this.selectedSchedule === schedule.alias && this.selectedTask === task.name) {
        this.selectedSchedule = null
        this.selectedTask = null
      } else {
        this.selectedSchedule = schedule.alias
        this.selectedTask = task.name
      }
    },
    loadWeek: async function () {
      if (!this.weekId) return
      const choreId = this.choreId
      const week = await store.getWeek(this.weekId)
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
.schedule, .history-items {
    display:block;
    position:relative;
    box-shadow:0 2px 0 -1px #ebebeb;
}
.schedule > .header, .history-items > .header {
    font-size: 24px;
    font-weight: bold;
    display:block;
    position:relative;
    margin: 20px 5px;
    padding: 8px 0;
    box-shadow:0 2px 0 -1px #ebebeb;
}
.task > .header {
    text-align: left;
}
.task svg {
    width: 16px;
    height: 16px;
}
</style>
