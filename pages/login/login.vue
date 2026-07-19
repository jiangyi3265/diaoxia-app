<template>
  <view class="page">
    <view class="status-space" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="brand-row">
      <image class="logo" :src="logoUrl" mode="aspectFill" />
      <view class="brand-copy">
        <text class="brand-name">钓虾生活馆</text>
        <text class="brand-note">预约、会员、商城一站完成</text>
      </view>
    </view>

    <view class="scene">
      <image :src="sceneUrl" mode="aspectFill" />
      <view class="scene-shade"></view>
      <view class="scene-copy">
        <text class="eyebrow">轻松到店</text>
        <text class="headline">把好位置，提前留给你</text>
        <text class="description">登录后可预约钓位、查看会员权益，并在商城选购到店好物。</text>
      </view>
    </view>

    <view class="benefits">
      <view v-for="item in benefits" :key="item.title" class="benefit">
        <view class="benefit-icon"><xy-icon :name="item.icon" :size="36" color="#0B756E" :weight="1.8" /></view>
        <view><text class="benefit-title">{{ item.title }}</text><text class="benefit-note">{{ item.note }}</text></view>
      </view>
    </view>

    <view class="login-panel">
      <view v-if="inviteCode" class="invite-tip"><xy-icon name="gift" :size="30" color="#0B756E" /><text>已收到好友邀请，登录后自动关联</text></view>
      <button class="login-button" :disabled="loggingIn || checking" @click="login">
        <xy-icon name="user" :size="38" color="#F3FCF9" :weight="2" />
        <text>{{ buttonText }}</text>
      </button>
      <text class="agreement">登录即表示你同意使用微信身份完成小程序账号登录</text>
    </view>
    <view class="safe-bottom"></view>
  </view>
</template>

<script>
import { appRequest, clearMemberSession, createMemberSession, hasMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      statusBarHeight: 20,
      checking: false,
      loggingIn: false,
      inviteCode: '',
      logoUrl: '/static/logo.png',
      sceneUrl: '/static/img/store1.jpg',
      benefits: [
        { title: '在线选座', note: '空闲场次与座位一目了然', icon: 'calendar-check' },
        { title: '会员权益', note: '预约与商城优惠集中管理', icon: 'card' },
        { title: '订单随时查', note: '购买、提货和售后一站跟进', icon: 'invoice' }
      ]
    }
  },
  computed: {
    buttonText() {
      if (this.checking) return '正在确认登录状态'
      if (this.loggingIn) return '正在登录'
      return '微信快捷登录'
    }
  },
  created() {
    try { this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20 } catch (error) {}
  },
  onLoad(query) {
    const inviteCode = String((query && query.inviteCode) || '').trim().toUpperCase()
    if (/^\d{6}$/.test(inviteCode)) {
      this.inviteCode = inviteCode
      uni.setStorageSync('xy.pending.invite', inviteCode)
    } else if (inviteCode) {
      this.inviteCode = ''
      uni.removeStorageSync('xy.pending.invite')
    }
  },
  onShow() {
    this.checkExistingSession()
  },
  methods: {
    async checkExistingSession() {
      if (!hasMemberSession() || this.loggingIn) return
      this.checking = true
      try {
        await appRequest({ url: '/app/me' })
        uni.removeStorageSync('xy.pending.invite')
        uni.reLaunch({ url: '/pages/index/index' })
      } catch (error) {
        clearMemberSession()
      } finally {
        this.checking = false
      }
    },
    async login() {
      if (this.loggingIn || this.checking) return
      this.loggingIn = true
      try {
        await createMemberSession()
        uni.reLaunch({ url: '/pages/index/index' })
      } catch (error) {
        showRequestError(error)
      } finally {
        this.loggingIn = false
      }
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;padding:0 28rpx;background:#edf5f3;color:#18322e}.status-space{width:100%}.brand-row{display:flex;align-items:center;gap:18rpx;padding:22rpx 4rpx 28rpx}.logo{width:76rpx;height:76rpx;border-radius:24rpx;box-shadow:0 10rpx 28rpx rgba(11,117,110,.15)}.brand-copy{display:flex;flex-direction:column;gap:5rpx}.brand-name{font-size:31rpx;font-weight:750}.brand-note{color:#718681;font-size:22rpx}.scene{position:relative;overflow:hidden;height:490rpx;border-radius:38rpx;background:#164b46;box-shadow:0 22rpx 54rpx rgba(15,72,67,.18)}.scene image{width:100%;height:100%}.scene-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,45,41,.05) 18%,rgba(7,45,41,.83) 100%)}.scene-copy{position:absolute;right:34rpx;bottom:34rpx;left:34rpx;display:flex;flex-direction:column}.eyebrow{width:max-content;margin-bottom:14rpx;padding:8rpx 16rpx;border-radius:18rpx;background:rgba(225,249,242,.16);color:#dff8f1;font-size:21rpx;font-weight:650}.headline{color:#f2fcf8;font-size:43rpx;font-weight:780;letter-spacing:-1rpx}.description{max-width:29em;margin-top:15rpx;color:#c4e4dc;font-size:24rpx;line-height:1.6}.benefits{padding:28rpx 8rpx 18rpx}.benefit{display:flex;align-items:center;gap:20rpx;min-height:94rpx;border-bottom:1rpx solid #dce9e5}.benefit:last-child{border-bottom:0}.benefit-icon{display:flex;align-items:center;justify-content:center;width:64rpx;height:64rpx;border-radius:20rpx;background:#dcefe9}.benefit view:last-child{display:flex;flex-direction:column;gap:6rpx}.benefit-title{font-size:26rpx;font-weight:700}.benefit-note{color:#748984;font-size:21rpx}.login-panel{padding:12rpx 0 18rpx}.login-button{display:flex;align-items:center;justify-content:center;gap:14rpx;width:100%;height:98rpx;border-radius:28rpx;background:#0b756e;color:#f3fcf9;font-size:29rpx;font-weight:700;box-shadow:0 14rpx 34rpx rgba(11,117,110,.24)}.login-button[disabled]{opacity:.62}.agreement{display:block;margin-top:18rpx;color:#8a9c98;font-size:20rpx;text-align:center}.safe-bottom{height:calc(env(safe-area-inset-bottom) + 20rpx)}
.invite-tip{display:flex;align-items:center;justify-content:center;gap:10rpx;min-height:64rpx;margin-bottom:16rpx;border-radius:20rpx;background:#dff1ed;color:#466963;font-size:22rpx}
</style>
