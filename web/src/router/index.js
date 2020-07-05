import Vue from 'vue'
import VueRouter from 'vue-router'
import ChoreList from '../views/ChoreList.vue'
import ChoreDetail from '../views/ChoreDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ChoreList
  },
  {
    path: '/list/:weekId',
    name: 'ChoreList',
    component: ChoreList
  },
  {
    path: '/detail/:weekId/:choreId',
    name: 'ChoreDetail',
    component: ChoreDetail
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
