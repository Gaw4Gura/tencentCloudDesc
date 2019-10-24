const app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });

      this.addUser(app.globalData.userInfo);
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })

        this.addUser(res.userInfo);
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;

          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });

          this.addUser(app.globalData.userInfo);
        }
      })
    }
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      
      this.addUser(app.globalData.userInfo);
    }
  },

  async addUser(user) {
    if (app.globalData.hasUser) {
      return;
    }
    const db = wx.cloud.database();
    let result = await db.collection('user').add({
      data: {
        nickName: user.nickName,
        albums: [],
        folders: []
      }
    });
    app.globalData.nickName = user.nickName;
    app.globalData.id = result._id;
  }
})