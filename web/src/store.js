const API_PATH = process.env.VUE_APP_API_PATH

const store = {
  debug: true,
  state: {
    weeks: localStorage.weeks || {},
    currentWeek: null,
    currentWeekId: null
  },
  setWeek: function (weekId) {
    const me = this

    if (me.debug) console.log('Setting week ' + weekId)
    me.state.currentWeekId = weekId
    me.state.currentWeek = me.state.weeks[weekId]

    return new Promise(function (resolve, reject) {
      if (me.debug) console.log('Getting from server')
      fetch(API_PATH + 'GetChores?weekId=' + encodeURIComponent(weekId), {
        cache: 'no-cache'
      }).then(function (resp) {
        if (resp.status !== 200) {
          if (me.debug) console.log('Invalid GetChores Response - ' + resp.status)
          reject(new Error('Invalid GetChores Response - ' + resp.status))
        } else {
          resp.json().then(function (body) {
            const data = typeof body === 'string' ? JSON.parse(body) : body
            me.state.weeks[weekId] = data
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
    await me.setWeek(weekId)
  }
}

export default store
