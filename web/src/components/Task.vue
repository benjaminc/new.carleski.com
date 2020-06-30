<template>
    <li class="task">
        <div class="header">
            <a href="#" @click.prevent.stop="expanded = !expanded">
                {{task.name}}
                <Images v-if="task.imageUrls.length" />
                <QuestionCircle v-if="task.exampleUrl" />
            </a>
        </div>
        <div class="details" v-show="expanded">
            <div class="example" v-if="task.exampleUrl">
                <div class="header">Example</div>
                <label v-if="isParent">
                    <span>Upload New Example Image</span>
                    <input type="file" accept="image/*" capture="camera" style="display:none" @change="uploadImage($event, true)" />
                </label>
                <img :src="task.exampleUrl" />
            </div>
            <div class="uploads" v-if="task.imageUrls.length">
                <div class="header">Uploaded Images</div>
                <label>
                    <span>Upload Image of Task</span>
                    <input type="file" accept="image/*" capture="camera" style="display:none" @change="uploadImage($event, false)" />
                </label>
                <div class="image" v-for="img in task.imageUrls" :key="img.url">
                    <div class="header">By {{img.by}} at {{img.at}}</div>
                    <img :src="img.url" />
                </div>
            </div>
        </div>
    </li>
</template>

<script>
import Images from '../assets/images.svg'
import QuestionCircle from '../assets/question-circle.svg'
import store from '../store'
export default {
  components: { Images, QuestionCircle },
  props: ['chore', 'schedule', 'task'],
  data: function () {
    return {
      state: store.state,
      expanded: false
    }
  },
  computed: {
    isParent: function () {
      const hasRole = this.state.user && this.state.user.userRoles ? this.state.user.userRoles.indexOf('parent') >= 0 : false
      return hasRole
    }
  },
  methods: {
    uploadImage: async function (event, isExample) {
      await store.uploadImage(
        this.$route.params.weekId,
        this.$route.params.choreId,
        this.schedule.alias,
        this.task.name,
        event.target.files[0],
        isExample)
    }
  }
}
</script>

<style scoped>
.task > .header {
    text-align: left;
}
.task > .header a {
  color: #3540eb;
  text-decoration: none;
}
.task svg {
    margin-left: 8px;
    width: 16px;
    height: 16px;
}
</style>
