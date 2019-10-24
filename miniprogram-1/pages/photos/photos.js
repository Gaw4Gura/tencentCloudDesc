const app = getApp();
const db = wx.cloud.database();
const cmd = db.command;

Page({
  albumID: undefined,

  data: {
    albumIndex: '',
    photos: [],
    photoIds: []
  },

  onLoad(options) {
    this.albumID = options.id;
  },

  onShow() {
    this.getPhotos();
  },

  addPhoto(e) {
    wx.navigateTo({
      url: '/pages/photos/add?id=' + this.albumID,
    });
  },

  longpress(e) {
    const imgIndex = e.currentTarget.dataset.index;

    wx.showActionSheet({
      itemList: ['删除照片'],
      success: res => {
        if (res.tapIndex === 0) {
          this.deleteFile(imgIndex);
        }
      }
    })
  },

  async deleteFile(idx) {
    const fileID = this.data.photoIds[idx];
    const photos = app.globalData.allData.albums[this.albumID].photos;
    const newFileIds = this.data.photoIds.filter(id => id !== fileID);
    const newPhotos = photos.filter(photo => !!~newFileIds.indexOf(photo.fileID));

    app.globalData.allData.albums[this.albumID].photos = newPhotos;

    db.collection('user').doc(app.globalData.id).update({
      data: {
        albums: cmd.set(app.globalData.allData.albums)
      }
    }).then(result => {
      wx.navigateBack();
    });
  },

  async getPhotos() {
    const userinfo = await db.collection('user').doc(app.globalData.id).get();
    const albums = userinfo.data.albums;
    const photos = albums[this.albumID].photos;

    app.globalData.allData.albums[this.albumID].photos = photos;

    const fileList = photos.map(photo => photo.fileID);
    const photoIds = [];
    const realUrlRes = await wx.cloud.getTempFileURL({fileList});
    const realUrls = realUrlRes.fileList.map(file => {
      photoIds.push(file.fileID);
      return file.tempFileURL;
    });

    this.setData({
      albumIndex: this.albumID,
      photos: realUrls,
      photoIds
    });
  },

  async previewImage(e) {
    const currentIndex = e.currentTarget.dataset.index;
    const currentUrl = this.data.photos[currentIndex];

    wx.previewImage({
      current: currentUrl,
      urls: this.data.photos,
    });
  }
})