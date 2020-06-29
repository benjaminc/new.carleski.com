const API_PATH = process.env.VUE_APP_API_PATH

const store = {
  debug: true,
  state: {
    weeks: {}
  },
  getWeek: async function (weekId, forceRefresh) {
    const me = this
    if (me.debug) console.log('Getting week ' + weekId)
    if (!forceRefresh && me.state.weeks[weekId]) {
      if (me.debug) console.log('Got week from cache')
      return me.state.weeks[weekId]
    }

    if (me.debug) console.log('Getting from server')
    var resp = await fetch(API_PATH + 'GetChores?weekId=' + encodeURIComponent(weekId), {
      cache: 'no-cache'
    })
    if (resp.status !== 200) {
      if (me.debug) console.log('Invalid GetChores Response - ' + resp.status)
      return null;
    }
    const body = await resp.json()
    const data = typeof body === 'string' ? JSON.parse(body) : body
    me.state.weeks[weekId] = data
    return data
  },
  computeWeekId: function (date) {
    const ms = date ? date.getTime() : Date.now()
    return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
  },
  setChoreComplete: async function (weekId, choreId, complete) {
    const me = this
    const resp = await fetch(API_PATH + 'SetChoreComplete?weekId=' + encodeURIComponent(weekId) + '&choreId=' + encodeURIComponent(choreId) + '&complete=' + (complete === true), {
      cache: 'no-cache'
    })

    if (resp.status !== 200) {
      if (me.debug) console.log('Invalid SetChoreComplete Response - ' + resp.status)
    }
    me.getWeek(weekId, true)
  }
}

export default store
