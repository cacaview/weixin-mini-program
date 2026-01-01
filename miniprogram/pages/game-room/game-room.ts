/**
 * 游戏房间页面
 */

Page({
  data: {
    roomId: 'ROOM001',
    roomStatus: 'waiting',
    isHost: true,
    players: [
      { id: '1', name: '玩家1（房主）', avatar: '', isReady: true, isHost: true, roleId: 'r1', roleName: '李明' },
      { id: '2', name: '玩家2', avatar: '', isReady: false, isHost: false }
    ],
    maxPlayers: 6,
    roles: [
      { id: 'r1', name: '李明', description: '地下党联络员', isSelected: true },
      { id: 'r2', name: '王芳', description: '绣娘', isSelected: false },
      { id: 'r3', name: '张伟', description: '商人', isSelected: false },
      { id: 'r4', name: '陈红', description: '教师', isSelected: false }
    ],
    selectedRoleId: 'r1',
    isReady: false,
    currentScene: null as any,
    showRoleSelect: false,
    scriptTitle: '红色密信'
  },

  onLoad(options: any) {
    const { roomId, scriptId } = options;
    if (roomId) {
      this.setData({ roomId });
    }
  },

  onUnload() {},

  onShowRoleSelect() {
    this.setData({ showRoleSelect: true });
  },

  onCloseRoleSelect() {
    this.setData({ showRoleSelect: false });
  },

  onSelectRole(e: any) {
    const { roleId } = e.currentTarget.dataset;
    const roles = this.data.roles.map(r => ({
      ...r,
      isSelected: r.id === roleId ? true : r.isSelected
    }));
    this.setData({ roles, selectedRoleId: roleId, showRoleSelect: false });
    wx.showToast({ title: '选择成功', icon: 'success' });
  },

  onToggleReady() {
    if (!this.data.selectedRoleId) {
      wx.showToast({ title: '请先选择角色', icon: 'none' });
      return;
    }
    this.setData({ isReady: !this.data.isReady });
  },

  onStartGame() {
    if (this.data.players.length < 2) {
      wx.showToast({ title: '至少需要2名玩家', icon: 'none' });
      return;
    }
    this.setData({
      roomStatus: 'playing',
      currentScene: {
        id: 's1',
        name: '剪纸工坊',
        description: '这是一间充满剪纸作品的工坊，墙上挂满了各式各样的窗花。一位老大娘正在专心剪纸。',
        npcs: [{ id: 'npc1', name: '李大娘', role: '剪纸艺人' }]
      }
    });
  },

  onTalkToNPC(e: any) {
    const { npcId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/npc-chat/npc-chat?roomId=${this.data.roomId}&npcId=${npcId}`
    });
  },

  onViewClues() {
    wx.showToast({ title: '线索本功能开发中', icon: 'none' });
  },

  onLeaveRoom() {
    wx.showModal({
      title: '提示',
      content: '确定要离开房间吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  onCopyRoomId() {
    wx.setClipboardData({
      data: this.data.roomId,
      success: () => {
        wx.showToast({ title: '房间号已复制', icon: 'success' });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `邀请你加入《${this.data.scriptTitle}》游戏房间`,
      path: `/pages/game-room/game-room?roomId=${this.data.roomId}`
    };
  }
});