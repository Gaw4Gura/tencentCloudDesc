const app = getApp();
const db = wx.cloud.database();
const cmd = db.command;

Page({
  isLoaded: false,

  data: {
    folders: [],
    inputValue: '',
    dialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    error: ''
  },

  onLoad() {
    this.checkUser();
  },

  onShow() {
    if (this.isLoaded) {
      this.getFolders();
    }
  },

  async checkUser() {
    const user = await db.collection('user').get();

    if (!user.data.length) {
      app.globalData.hasUser = false;
      return wx.switchTab({
        url: '/pages/user/user',
      });
    }

    const userinfo = user.data[0];
    app.globalData.hasUser = true;
    app.globalData.id = userinfo._id;
    app.globalData.nickName = userinfo.nickName;
    app.globalData.allData.folders = userinfo.folders;

    this.getFolders(userinfo.folders);
  },

  async getFolders(foldersParam) {
    const folders = foldersParam || app.globalData.allData.folders;

    for (const folder of folders) {
      if (!folder) {
        continue;
      }
    }

    this.setData({folders});
    this.isLoaded = true;
  },

  addFolders(e) {
    this.setData({
      dialogShow: true
    });
  },

  keyInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  async formSubmit(e) {
    if (e.detail.index == 1) {
      let foldersName = this.data.inputValue;

      if (!!foldersName) {
        app.globalData.allData.folders.push({foldersName: foldersName, files: []});

        let result = await db.collection('user').doc(app.globalData.id).update({
          data: {
            albums: cmd.set(app.globalData.allData.albums),
            folders: cmd.set(app.globalData.allData.folders)
          }
        });

        this.setData({
          dialogShow: false
        });
        wx.reLaunch({
          url: '/pages/folder/folder',
        });
      } else {
        this.setData({
          error: '文件夹名称不能为空'
        });
      }
    } else {
      this.setData({
        dialogShow: false
      });
    }
  }
})