<template>
    <div class="history-items" v-if="history.length">
        <div class="header">Historical Actions</div>
        <div class="history-item" v-for="item in history" :key="item.at">{{item.complete ? 'Completed' : 'Uncompleted'}} at {{item.at}} by {{item.by}}</div>
    </div>
</template>

<script>
export default {
  props: ['history']
}
</script>

<style scoped>
.history-items {
    display:block;
    position:relative;
    box-shadow:0 2px 0 -1px #ebebeb;
}
.history-items > .header {
    font-size: 24px;
    font-weight: bold;
    display:block;
    position:relative;
    margin: 20px 5px;
    padding: 8px 0;
    box-shadow:0 2px 0 -1px #ebebeb;
}
</style>
