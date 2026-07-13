<template>
  <view class="page">
    <xy-header title="我的会员卡" />
    <view class="wrap">
      <view v-if="card" class="member-card">
        <view class="card-top"><view class="brand"><xy-icon name="crown" :size="38" color="#F5DCA7" :weight="1.8" /><text>钓虾生活馆</text></view><text class="state">有效会员</text></view>
        <text class="plan">{{ card.planName }}</text>
        <text class="number">{{ card.cardNo }}</text>
        <view class="card-bottom"><view><text>有效期至</text><text>{{ card.expireDate }}</text></view><view><text>累计预约</text><text>{{ card.usageCount || 0 }} 次</text></view></view>
      </view>
      <view v-else class="empty-card">
        <view class="empty-icon"><xy-icon name="card" :size="62" color="#0B756E" :weight="1.6" /></view>
        <text class="empty-title">还没有会员卡</text><text class="empty-note">开通后可在线预约座位，并享受商城会员优惠。</text>
        <button class="primary" @click="join">查看会员方案</button>
      </view>

      <view v-if="card" class="actions">
        <button class="primary" @click="code"><xy-icon name="qrcode" :size="36" color="#F3FCF9" :weight="1.8" />出示会员码</button>
        <button class="secondary" @click="profile"><xy-icon name="user" :size="34" color="#0B756E" :weight="1.8" />会员资料</button>
      </view>

      <view class="rights">
        <text class="section-title">会员权益</text>
        <view class="right-row"><view class="right-icon"><xy-icon name="calendar-check" :size="34" color="#0B756E" :weight="1.8" /></view><view><text>在线预约钓位</text><text>提前查看空闲场次与座位</text></view></view>
        <view class="right-row"><view class="right-icon sand"><xy-icon name="tag" :size="34" color="#94662E" :weight="1.8" /></view><view><text>商城会员优惠</text><text>参与优惠的商品自动显示会员价</text></view></view>
      </view>
    </view>
  </view>
</template>
<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default { data(){return{card:null}}, onShow(){this.load()}, methods:{ async load(){try{await ensureMemberSession();this.card=(await appRequest({url:'/app/me'})).card}catch(error){showRequestError(error)}}, join(){uni.navigateTo({url:'/pages/membership/join'})}, code(){uni.navigateTo({url:'/pages/membership/code'})}, profile(){uni.navigateTo({url:'/pages/membership/profile'})} } }
</script>
<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:28rpx}.member-card{position:relative;overflow:hidden;min-height:356rpx;padding:34rpx;border-radius:34rpx;background:#164b46;color:#f1faf7;box-shadow:0 20rpx 48rpx rgba(16,67,62,.22)}.member-card::after{content:'';position:absolute;right:-80rpx;top:-96rpx;width:300rpx;height:300rpx;border:2rpx solid rgba(245,220,167,.16);border-radius:50%}.card-top,.card-bottom{position:relative;z-index:1;display:flex;justify-content:space-between}.brand{display:flex;align-items:center;gap:12rpx;font-weight:700}.state{padding:8rpx 14rpx;border-radius:18rpx;background:rgba(245,220,167,.14);color:#f5dca7;font-size:20rpx}.plan{position:relative;z-index:1;display:block;margin-top:48rpx;font-size:40rpx;font-weight:780}.number{position:relative;z-index:1;display:block;margin-top:12rpx;color:#bcd9d3;font-size:23rpx;letter-spacing:4rpx}.card-bottom{margin-top:50rpx}.card-bottom view{display:flex;flex-direction:column;gap:7rpx}.card-bottom text:first-child{color:#9fc1ba;font-size:20rpx}.card-bottom text:last-child{font-size:24rpx;font-weight:650}.empty-card{display:flex;flex-direction:column;align-items:center;padding:68rpx 42rpx;border:1rpx solid #dbe8e4;border-radius:34rpx;background:#f8fcfa;text-align:center}.empty-icon{display:flex;align-items:center;justify-content:center;width:112rpx;height:112rpx;border-radius:34rpx;background:#dcefe9}.empty-title{margin-top:26rpx;font-size:32rpx;font-weight:750}.empty-note{max-width:26em;margin-top:12rpx;color:#748984;font-size:23rpx;line-height:1.6}.actions{display:grid;grid-template-columns:1.35fr 1fr;gap:16rpx;margin-top:24rpx}.primary,.secondary{display:flex;align-items:center;justify-content:center;gap:10rpx;height:92rpx;border-radius:26rpx;font-size:26rpx;font-weight:700}.primary{margin-top:28rpx;padding:0 34rpx;background:#0b756e;color:#f3fcf9}.actions .primary{margin-top:0}.secondary{border:1rpx solid #cfe0dc;background:#f8fcfa;color:#0b756e}.rights{margin-top:38rpx}.section-title{display:block;margin:0 4rpx 14rpx;font-size:29rpx;font-weight:750}.right-row{display:flex;align-items:center;gap:18rpx;min-height:106rpx;border-bottom:1rpx solid #dce8e5}.right-icon{display:flex;align-items:center;justify-content:center;width:64rpx;height:64rpx;border-radius:20rpx;background:#dcefe9}.right-icon.sand{background:#f3e7d5}.right-row>view:last-child{display:flex;flex-direction:column;gap:6rpx}.right-row>view:last-child text:first-child{font-size:25rpx;font-weight:700}.right-row>view:last-child text:last-child{color:#7b8e89;font-size:21rpx}
</style>
