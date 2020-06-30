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
            <div class="example">
                <div class="header">Example</div>
                <div class="button" v-if="isParent">
                    <label>
                        <span>Upload New Example Image</span>
                        <input type="file" accept="image/*" capture="camera" style="display:none" @change="uploadImage($event, true)" />
                    </label>
                </div>
                <div>
                    <img :src="task.exampleUrl" v-if="task.exampleUrl" />
                </div>
            </div>
            <div class="uploads">
                <div class="header">Uploaded Images</div>
                <div class="button">
                    <label>
                        <span>Upload Image of Task</span>
                        <input type="file" accept="image/*" capture="camera" style="display:none" @change="uploadImage($event, false)" />
                    </label>
                </div>
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
.task {
    margin-top: 16px;
    margin-bottom: 16px;
}
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

.details {
    margin-top: 12px;
    margin-bottom: 40px;
}
.example > .header, .uploads > .header {
    font-size: 18px;
    font-weight: bold;
}
.example, .uploads {
    margin-bottom: 40px;
}
.button {
    display: inline-block;
    margin-top: 12px;
    padding: 8px 16px;
    border: solid 3px #e0e0e0;
}
.button, .button label, .button label span {
    cursor: pointer;
}
</style>
