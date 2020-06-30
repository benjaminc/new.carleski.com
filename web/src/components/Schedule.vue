<template>
    <div class="schedule">
        <div class="header">{{schedule.name}}</div>
        <div class="tasks">
            <ol>
                <Task :chore="chore" :schedule="schedule" :task="task" v-for="task in schedule.tasks" :key="task.name" />
            </ol>
        </div>
    </div>
</template>

<script>
import Task from './Task'
export default {
  components: { Task },
  props: ['chore', 'schedule']
}
</script>

<style scoped>
.schedule {
    display:block;
    position:relative;
    box-shadow:0 2px 0 -1px #ebebeb;
}
.schedule > .header {
    font-size: 24px;
    font-weight: bold;
    display:block;
    position:relative;
    margin: 20px 5px;
    padding: 8px 0;
    box-shadow:0 2px 0 -1px #ebebeb;
}
</style>
