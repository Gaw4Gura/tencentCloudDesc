const app = getApp();
const db = wx.cloud.database();
const cmd = db.command;

Page({
  albumID: undefined,
  folderID: undefined,

  data: {
    folderIndex: '',
    files: [],
    fileIds: [],
    realUrls: []
  },

  onLoad(options) {
    this.folderID = options.id;
  },

  onShow() {
    this.getFiles();
  },

  addFile(e) {
    wx.navigateTo({
      url: '/pages/files/add?id=' + this.folderID,
    });
  },

  async getFiles() {
    const userinfo = await db.collection('user').doc(app.globalData.id).get();
    const folders = userinfo.data.folders;
    const files = folders[this.folderID].files;
    app.globalData.allData.folders[this.folderID].files = files;
    const fileList = files.map(file => file.fileID);
    const fileIds = [];
    const realUrlRes = await wx.cloud.getTempFileURL({fileList});
    const realUrls = realUrlRes.fileList.map(file => {
      fileIds.push(file.fileID);
      return file.tempFileURL;
    });

    this.setData({
      folderIndex: this.folderID,
      files,
      realUrls: realUrls
    });
  },

  longpress(e) {
    const fileIndex = e.currentTarget.dataset.index;
    const realUrl = this.realUrls[fileIndex];

    wx.setClipboardData({
      data: realUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data);
          }
        });
      }
    });
  }
})