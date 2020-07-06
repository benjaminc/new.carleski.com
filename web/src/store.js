const API_PATH = process.env.VUE_APP_API_PATH
const DEFAULT_USER = process.env.VUE_APP_DEFAULT_USER ? JSON.parse(process.env.VUE_APP_DEFAULT_USER) : (localStorage.user ? JSON.parse(localStorage.user) : null)

const doComputeWeekId = (date) => Math.round(date ? date.getTime() : Date.now() / (7 * 24 * 60 * 60 * 1000))
const curWeekId = doComputeWeekId()
const curWeekKey = 'week' + curWeekId
const storedWeekStr = localStorage.getItem(curWeekKey)
const storedWeek = storedWeekStr ? JSON.parse(storedWeekStr) : null

window.choresDataStore = window.choresDataStore || {
  debug: true,
  useCustomHeader: DEFAULT_USER !== null,
  state: {
    weeks: storedWeek ? { curWeekId: storedWeekStr } : {},
    currentWeek: null,
    currentWeekId: null,
    homeWeekId: curWeekId,
    user: DEFAULT_USER
  },
  verifyUser: async function () {
    if (this.state.user !== null) return true

    const resp = await fetch('/.auth/me')

    if (resp.status === 200) {
      const payload = await resp.json()

      if (payload && payload.clientPrincipal) {
        this.state.user = payload.clientPrincipal
        localStorage.user = JSON.stringify(this.state.user)
        return true
      }
    }

    return false
  },
  setWeek: function (weekId) {
    const me = this

    if (!weekId) weekId = me.computeWeekId()
    if (me.debug) console.log('Setting week ' + weekId)
    me.state.currentWeekId = weekId
    me.state.currentWeek = me.state.weeks[weekId]

    return new Promise(function (resolve, reject) {
      if (me.debug) console.log('Getting from server')
      const options = { cache: 'no-cache' }
      if (me.useCustomHeader && me.state.user) options.headers = { 'x-carleski-chores': btoa(JSON.stringify(me.state.user)) }
      fetch(API_PATH + 'GetChores?weekId=' + encodeURIComponent(weekId), options).then(function (resp) {
        if (resp.status !== 200) {
          if (me.debug) console.log('Invalid GetChores Response - ' + resp.status)
          reject(new Error('Invalid GetChores Response - ' + resp.status))
        } else {
          resp.json().then(function (body) {
            const data = typeof body === 'string' ? JSON.parse(body) : body
            me.state.weeks[weekId] = data
            localStorage.setItem('week' + weekId, JSON.stringify(me.state.weeks))
            if (me.state.currentWeekId === weekId) me.state.currentWeek = data
            resolve(data)
          }, function (err) {
            reject(err)
          })
        }
      }, function (err) {
        reject(err)
      })
    })
  },
  computeWeekId: doComputeWeekId,
  setChoreComplete: async function (weekId, choreId, complete) {
    const me = this
    const options = { cache: 'no-cache' }
    if (me.useCustomHeader && me.state.user) options.headers = { 'x-carleski-chores': btoa(JSON.stringify(me.state.user)) }
    const resp = await fetch(API_PATH + 'SetChoreComplete?weekId=' + encodeURIComponent(weekId) + '&choreId=' + encodeURIComponent(choreId) + '&complete=' + (complete === true), options)

    if (resp.status !== 200) {
      if (me.debug) console.log('Invalid SetChoreComplete Response - ' + resp.status)
    }
    await me.setWeek(weekId)
  },
  uploadImage: async function (weekId, choreId, scheduleAlias, taskName, file, isExample) {
    const me = this
    const formData = new FormData()
    formData.append('file', file)

    const options = { method: 'POST', body: formData, cache: 'no-cache' }
    if (me.useCustomHeader && me.state.user) options.headers = { 'x-carleski-chores': btoa(JSON.stringify(me.state.user)) }
    const resp = await fetch(API_PATH + 'UploadImage?weekId=' + encodeURIComponent(weekId) +
      '&choreId=' + encodeURIComponent(choreId) +
      '&scheduleAlias=' + encodeURIComponent(scheduleAlias) +
      '&taskName=' + encodeURIComponent(taskName) +
      (isExample === true ? '&isExample=true' : ''), options)

    if (resp.status !== 200) {
      if (me.debug) console.log('Invalid UploadImage Response - ' + resp.status)
    }
    await me.setWeek(weekId)
  }
}

export default window.choresDataStore
