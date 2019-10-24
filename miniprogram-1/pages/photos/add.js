const app = getApp();
const db = wx.cloud.database();
const cmd = db.command;

Page({
  data: {
    currentPhoto: false,
    albumIndex: -1,
    albums: [],
    photosOrigin: [],
    photosNew: [],
    newphotos_url: [],
    index: ''
  },

  onLoad(options) {
    this.setData({
      albumIndex: options.id,
      photosOrigin: app.globalData.allData.albums[options.id].photos
    });
  },

  formSubmit(e) {
    wx.showLoading({
      title: '加载中',
    });

    const uploadTasks = this.data.photosNew.map(item => this.uploadPhoto(item.src));

    Promise.all(uploadTasks).then(result => {
      this.addPhotos(result, e.detail.value.desc);
      wx.hideLoading();
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({
        title: '图片上传错误',
        icon: 'error'
      });
    });
  },

  chooseImage: function () {
    const items = this.data.photosNew;

    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let tempFilePaths = res.tempFilePaths;

        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath
          });
        }

        this.setData({
          photosNew: items
        });
      }
    });
  },

  uploadPhoto(filePath) {
    return wx.cloud.uploadFile({
      cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`,
      filePath
    });
  },

  previewImage(e) {
    const curret = e.target.dataset.src;
    const photots = this.data.photosNew.map(photo => photo.src);

    wx.previewImage({
      current: current.src,
      urls: photos,
    });
  },

  cancel(e) {
    const index = e.currentTarget.dataset.index;
    const photos = this.data.photosNew.filter((p, idx) => idx !== index);

    this.setData({
      photosNew: photos
    });
  },

  addPhotos(photos, comment) {
    const oldPhotos = app.globalData.allData.albums[this.data.albumIndex].photos;
    const albumPhotos = photos.map(photo => ({
      fileID: photo.fileID,
      comments: comment
    }))

    app.globalData.allData.albums[this.data.albumIndex].photos = [...oldPhotos, ...albumPhotos];

    db.collection('user').doc(app.globalData.id).update({
      data: {
        albums: cmd.set(app.globalData.allData.albums)
      }
    }).then(result => {
      wx.navigateBack();
    })
  }
})