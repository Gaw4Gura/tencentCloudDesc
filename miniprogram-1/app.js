//app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.log('please update to version 2.2.3 or later!')
    } else {
      wx.cloud.init({
        env: 'cloudpan-3253q',
        traceUser: true,
      })
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          wx.switchTab({
            url: '/pages/user/user',
          })
        }
      }
    })
  },

  globalData: {
    hasUser: false,
    hasUserInfo: false,
    userInfo: null,
    checkResult: null,
    code: null,
    openid: null,
    flag: 0,
    nickName: '',
    allData: {
      albums: [],
      folders: []
    },
    id: null
  }
})