const app = getApp();
const db = wx.cloud.database();
const cmd = db.command;

Page({
  data: {
    currentPhoto: false,
    folderIndex: -1,
    folders: [],
    filesOrigin: [],
    filesNew: [],
    newfiles_url: [],
    index: ''
  },

  onLoad(options) {
    this.setData({
      folderIndex: options.id,
      filesOrigin: app.globalData.allData.folders[options.id].files
    });
  },

  formSubmit(e) {
    wx.showLoading({
      title: '加载中',
    })

    const uploadTask = this.data.filesNew.map(item => this.uploadFile(item.src));
    
    Promise.all(uploadTask).then(result => {
      this.addFiles(result, e.detail.value.desc);
      wx.hideLoading();
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({
        title: '文件上传错误',
        icon: 'error'
      });
    });
  },

  chooseMessageFile: function () {
    const items = this.data.filesNew;

    wx.chooseMessageFile({
      count: 5,
      success: res => {
        let tempFilePaths = res.tempFiles;

        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath.path,
            name: tempFilePath.name
          });
        }

        this.setData({
          filesNew: items
        });
      }
    });
  },

  uploadFile(filePath) {
    const cloudPath = `cloudbase/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}` + filePath.match(/\.[^.]+?$/)
    return wx.cloud.uploadFile({
      cloudPath, filePath
    })
  },

  previewImage(e) {
    const current = e.target.dataset.src;
    const files = this.data.filesNew.map(file => file.src);

    wx.previewImage({
      current: current.src,
      urls: files,
    });
  },

  cancel(e) {
    const index = e.currentTarget.dataset.index;
    const files = this.data.filesNew.filter((p, idx) => idx !== index);

    this.setData({
      filesNew: files
    });
  },

  addFiles(files, comment) {
    const oldFiles = app.globalData.allData.folders[this.data.folderIndex].files;
    const name = this.data.filesNew.map(file => file.name);
    const folderFiles = files.map((file, index) => ({
      fileID: file.fileID,
      comments: comment,
      name: name[index]
    }));

    app.globalData.allData.folders[this.data.folderIndex].files = [...oldFiles, ...folderFiles];

    db.collection('user').doc(app.globalData.id).update({
      data: {
        folders: cmd.set(app.globalData.allData.folders)
      }
    }).then(result => {
      wx.navigateBack();
    })
  }
})