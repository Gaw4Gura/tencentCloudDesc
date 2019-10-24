const app = getApp();
const db = wx.cloud.database();
const cmd = db.command;

Page({
  isLoaded: false,

  data: {
    albums: [],
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
      this.getAlbums();
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
    app.globalData.allData.albums = userinfo.albums;
    // console.log(userinfo);

    this.getAlbums(userinfo.albums);
  },

  async getAlbums(albumsParam) {
    const albums = albumsParam || app.globalData.allData.albums;

    for (const album of albums) {
      if (!album) {
        continue;
      }

      if (album.photos.length) {
        const fileID = album.photos[0].fileID;
        const {fileList} = await wx.cloud.getTempFileURL({fileList: [fileID]});
        album.coverURL = fileList[0].tempFileURL;
        continue;
      } else {
        album.coverURL = "https://tcb-1251009918.cos.ap-guangzhou.myqcloud.com/demo/default-cover.png";
      }
    }

    this.setData({albums});
    this.isLoaded = true;
  },

  addAlbum(e) {
    this.setData({
      dialogShow: true
    });
  },

  keyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  async formSubmit(e) {
    if (e.detail.index == 1) {
      let albumName = this.data.inputValue;
      if (!!albumName) {
        app.globalData.allData.albums.push({albumName: albumName, photos: []});
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
          url: '/pages/album/album'
        });
      } else {
        this.setData({
          error: '相册名不能为空'
        });
      }
    } else {
      this.setData({
        dialogShow: false
      });
    }
  }
})