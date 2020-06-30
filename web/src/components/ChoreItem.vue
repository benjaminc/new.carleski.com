<template>
  <span class="chore-wrap" @click.prevent.stop="$router.push('/detail/' + weekId + '/' + chore.choreId)">
    <input type="checkbox" :id="id" :checked="chore.complete" />
    <span class="checknext">
        <span class="checkmark" @click.prevent.stop="toggleComplete" v-if="isParent">
            <Check />
        </span>
        <label :for="id" class="chore">
        {{chore.name}} - <strong>{{chore.assignedTo}}</strong>
        </label>
    </span>
    <span class="chore-details" title="details">
        <Images v-if="hasImages" />
        <InfoCircle />
    </span>
  </span>
</template>

<script>
import store from '../store'
import Check from '../assets/check.svg'
import Images from '../assets/images.svg'
import InfoCircle from '../assets/info-circle.svg'
export default {
  components: { Check, Images, InfoCircle },
  props: ['weekId', 'chore'],
  data: function () {
    return {
      state: store.state
    }
  },
  computed: {
    id: function () {
      return 'chore-' + this.chore.choreId
    },
    hasImages: function () {
      const schedules = this.chore.schedules
      let i = 0
      let j = 0
      let tasks = null

      for (; i < schedules.length; i++) {
        tasks = schedules[i].tasks
        for (j = 0; j < tasks.length; j++) {
          if (tasks[j].imageUrls.length > 0) return true
        }
      }

      return false
    },
    isParent: function () {
      const hasRole = this.state.user && this.state.user.userRoles ? this.state.user.userRoles.indexOf('parent') > 0 : false
      return hasRole
    }
  },
  methods: {
    toggleComplete: function () {
      this.chore.complete = !this.chore.complete
    }
  },
  watch: {
    'chore.complete': async function () {
      await store.setChoreComplete(this.weekId, this.chore.choreId, this.chore.complete)
    }
  }
}
</script>

<style scoped>
.chore-wrap{
    display:block;
    position:relative;
    padding-left:35px;
    box-shadow:0 2px 0 -1px #ebebeb;
    text-align: left;
    cursor: pointer;
}
.chore-wrap:last-of-type{
    box-shadow:none;
}
input[type="checkbox"]{
    position:absolute;
    height:0;
    width:0;
    opacity:0;
    top:-600px;
}
.checknext {
    text-align: left;
    cursor: pointer;
}
.chore{
    display:inline-block;
    font-weight:200;
    font-size:18px;
    padding:20px 5px;
    height:18px;
    position:relative;
    vertical-align: middle;
    cursor: pointer;
}
.chore:before{
    content:'';
    display:block;
    position:absolute;
    top:calc(50% + 1px);
    left:0;
    width:0%;
    height:1px;
    background:#cd4400;
    transition:.25s ease-in-out;
    cursor: pointer;
}
.checkmark:after{
    content:'';
    display:block;
    position:absolute;
    z-index:0;
    height:18px;
    width:18px;
    top:20px;
    left:12px;
    box-shadow:inset 0 0 0 2px #d8d8d8;
    transition:.25s ease-in-out;
    border-radius:4px;
    cursor: pointer;
}
.checkmark:hover:after{
    box-shadow:inset 0 0 0 2px #949494;
    cursor: pointer;
}
.checkmark svg{
    position:absolute;
    z-index:1;
    left:15px;
    top:20px;
    font-size:1px;
    line-height:16px;
    width:16px;
    height:16px;
    text-align:center;
    color:transparent;
    text-shadow:1px 1px 0 white, -1px -1px 0 white;
    cursor: pointer;
}
:checked + .checknext .chore{
    color:#717171;
}
:checked + .checknext .chore:before{
    width:100%;
}
:checked + .checknext .checkmark:after{
    box-shadow:inset 0 0 0 2px #0eb0b7;
}
:checked + .checknext .checkmark svg{
    font-size:20px;
    line-height:35px;
    color:#0eb0b7;
}

/* Details Link */
.chore-details{
    display:block;
    position:absolute;
    height:36px;
    width:36px;
    line-height:36px;
    right:0;
    top:12px;
    text-align:center;
    color:#d8d8d8;
    cursor: pointer;
}
.chore-details svg {
    color:#d8d8d8;
}
.chore-wrap:hover .chore-details svg{
    color:#0eb0b7;
}
</style>
