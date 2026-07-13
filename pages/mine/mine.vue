<template>
  <view class="page">
    <xy-header title="我的" variant="brand" :show-back="false" />
    <view class="profile-shell">
      <view class="identity">
        <view class="avatar"><text>{{ avatarText }}</text></view>
        <view class="identity-copy">
          <text class="name">{{ me.nickname || '微信会员' }}</text>
          <text class="mobile">{{ me.mobile || '未绑定手机号' }}</text>
        </view>
        <view class="member-badge" :class="{ active: me.card }">{{ me.card ? '有效会员' : '普通用户' }}</view>
      </view>
      <view class="member-summary" @click="go('/pages/membership/card')">
        <view><text class="summary-label">会员权益</text><text class="summary-value">{{ cardSummary }}</text></view>
        <view class="summary-action"><text>{{ me.card ? '查看会员卡' : '立即开通' }}</text><xy-icon name="chevron-right" :size="30" color="#0B756E" :weight="1.8" /></view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">我的服务</text>
      <view class="menu-list">
        <view v-for="(item,index) in menus" :key="item.url" class="menu-row" @click="go(item.url)">
          <view class="menu-icon" :class="item.tone"><xy-icon :name="item.icon" :size="36" :color="item.color" :weight="1.8" /></view>
          <view class="menu-copy"><text class="menu-title">{{ item.label }}</text><text class="menu-note">{{ item.note }}</text></view>
          <view class="menu-arrow"><xy-icon name="chevron-right" :size="30" color="#91A39F" :weight="1.7" /></view>
          <view v-if="index < menus.length - 1" class="divider"></view>
        </view>
      </view>
    </view>

    <button class="logout" @click="logout">退出当前账号</button>
    <view class="xy-tabbar-hold"></view>
    <xy-tabbar active="mine" />
  </view>
</template>

<script>
import { appRequest, clearMemberSession, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      me: {},
      menus: [
        { label:'会员资料', note:'昵称、手机号与邀请码', url:'/pages/membership/profile', icon:'user', tone:'mint', color:'#0B756E' },
        { label:'我的预约', note:'查看场次、座位与签到码', url:'/pages/reserve/history', icon:'calendar-check', tone:'blue', color:'#32778C' },
        { label:'我的订单', note:'支付、配送与售后进度', url:'/pages/order/list', icon:'invoice', tone:'sand', color:'#94662E' },
        { label:'消费账单', note:'会员与商城支付记录', url:'/pages/bills/bills', icon:'wallet', tone:'rose', color:'#A85B55' },
        { label:'收货地址', note:'管理商城配送地址', url:'/pages/order/address', icon:'location', tone:'mint', color:'#0B756E' },
        { label:'邀请好友', note:'分享你的专属邀请码', url:'/pages/invite/invite', icon:'share', tone:'blue', color:'#32778C' }
      ]
    }
  },
  computed: {
    avatarText() { return (this.me.nickname || '微').slice(0, 1) },
    cardSummary() { return this.me.card ? `${this.me.card.planName}，${this.me.card.expireDate} 到期` : '开通会员后可预约座位并享商城优惠' }
  },
  onShow() { this.load() },
  methods: {
    async load() {
      try { await ensureMemberSession(); this.me = await appRequest({ url:'/app/me' }) }
      catch (error) { showRequestError(error) }
    },
    go(url) { uni.navigateTo({ url }) },
    logout() {
      uni.showModal({
        title:'退出登录', content:'退出后需要重新使用微信登录。', confirmText:'退出', confirmColor:'#C94F45',
        success:({ confirm }) => { if (confirm) { clearMemberSession(); uni.reLaunch({ url:'/pages/login/login' }) } }
      })
    }
  }
}
</script>

<style scoped>
.page{--page-x:28rpx;min-height:100vh;background:#edf5f3}.profile-shell{padding:24rpx var(--page-x) 20rpx}.identity{display:flex;align-items:center;min-height:140rpx;gap:20rpx;padding:24rpx 4rpx}.avatar{display:flex;flex:0 0 92rpx;align-items:center;justify-content:center;width:92rpx;height:92rpx;border-radius:30rpx;background:#0b756e;color:#f1fbf7;font-size:34rpx;font-weight:750;box-shadow:0 12rpx 30rpx rgba(11,117,110,.2)}.identity-copy{display:flex;flex:1;min-width:0;flex-direction:column;justify-content:center;gap:7rpx}.name{font-size:34rpx;font-weight:750;color:#17322d;line-height:1.25}.mobile{font-size:22rpx;color:#758984;line-height:1.35}.member-badge{display:flex;flex:0 0 auto;align-items:center;justify-content:center;min-width:96rpx;height:46rpx;padding:0 14rpx;border-radius:18rpx;background:#e2ebe8;color:#768984;font-size:20rpx;font-weight:650;line-height:1}.member-badge.active{background:#f4e6bf;color:#87631f}.member-summary{display:flex;align-items:center;min-height:120rpx;justify-content:space-between;padding:22rpx 24rpx;border:1rpx solid #d8e6e2;border-radius:28rpx;background:#f8fcfa}.member-summary>view:first-child{display:flex;flex:1;min-width:0;flex-direction:column;justify-content:center;gap:8rpx}.summary-label{font-size:22rpx;color:#728681;line-height:1.2}.summary-value{max-width:430rpx;overflow:hidden;color:#1d3833;font-size:25rpx;font-weight:650;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}.summary-action{display:flex;flex:0 0 154rpx;align-items:center;justify-content:flex-end;gap:4rpx;color:#0b756e;font-size:22rpx;line-height:1}.section{padding:8rpx var(--page-x) 0}.section-title{display:flex;align-items:center;height:52rpx;margin:0 4rpx 10rpx;font-size:30rpx;font-weight:750;color:#17322d}.menu-list{overflow:hidden;border:1rpx solid #dce9e5;border-radius:30rpx;background:#f8fcfa}.menu-row{position:relative;display:flex;align-items:center;min-height:116rpx;padding:18rpx 22rpx}.menu-row:active{background:#eef6f3}.menu-icon{display:flex;flex:0 0 66rpx;align-items:center;justify-content:center;width:66rpx;height:66rpx;margin-right:18rpx;border-radius:20rpx}.menu-icon.mint{background:#dcefe9}.menu-icon.blue{background:#e0eef2}.menu-icon.sand{background:#f3e7d5}.menu-icon.rose{background:#f5e5e2}.menu-copy{display:flex;flex:1;min-width:0;flex-direction:column;justify-content:center;gap:6rpx}.menu-title{font-size:26rpx;font-weight:700;color:#1a3530;line-height:1.25}.menu-note{font-size:21rpx;color:#7b8e89;line-height:1.3}.menu-arrow{display:flex;flex:0 0 40rpx;align-items:center;justify-content:flex-end;width:40rpx;height:66rpx}.divider{position:absolute;right:22rpx;bottom:0;left:106rpx;height:1rpx;background:#e3ece9}.logout{display:flex;align-items:center;justify-content:center;width:calc(100% - 56rpx);height:88rpx;margin:28rpx 28rpx 0;border:1rpx solid #e2d7d5;border-radius:26rpx;background:#f7f1f0;color:#a04d46;font-size:25rpx;font-weight:650;line-height:1}
</style>
