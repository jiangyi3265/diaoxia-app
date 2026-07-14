<template>
  <view class="page">
    <xy-header title="联系客服" />
    <view class="intro">
      <view class="intro-icon"><xy-icon name="headset" :size="54" color="#0b756e" /></view>
      <text class="intro-title">需要帮助？我们在这里</text>
      <text class="intro-note">预约、会员、商城与退款问题都可以联系我们。</text>
    </view>

    <view class="actions">
      <button class="wechat" open-type="contact">
        <xy-icon name="chat" :size="38" color="#f4fbf9" />
        <view><text>微信客服</text><text>在线咨询，发送订单或预约信息</text></view>
        <xy-icon name="chevron-right" :size="30" color="#c9ebe6" />
      </button>
      <button class="phone" :disabled="!store.phone" @click="callStore">
        <xy-icon name="phone" :size="38" color="#0b756e" />
        <view><text>联系门店</text><text>{{ store.phone || '门店电话待配置' }}</text></view>
        <xy-icon name="chevron-right" :size="30" color="#91a39f" />
      </button>
    </view>

    <view v-if="store.storeName" class="store-info">
      <text class="store-name">{{ store.storeName }}</text>
      <view><xy-icon name="clock" :size="28" color="#6d817c" /><text>{{ store.businessHours || '营业时间待更新' }}</text></view>
      <view><xy-icon name="location" :size="28" color="#6d817c" /><text>{{ store.address || '门店地址待更新' }}</text></view>
    </view>
    <view class="tip"><xy-icon name="info" :size="28" color="#0a8f84" /><text>退款申请请从“我的订单”进入对应订单提交，客服会协助查看处理进度。</text></view>
  </view>
</template>

<script>
import { publicRequest, showRequestError } from '../../utils/api'

export default {
  data() { return { store: {} } },
  onLoad() { this.load() },
  methods: {
    async load() {
      try { const stores = await publicRequest({ url: '/app/stores' }); this.store = stores[0] || {} }
      catch (error) { showRequestError(error) }
    },
    callStore() { if (this.store.phone) uni.makePhoneCall({ phoneNumber: this.store.phone }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3;padding-bottom:50rpx}.intro{display:flex;flex-direction:column;align-items:center;padding:58rpx 36rpx 42rpx;text-align:center}.intro-icon{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:34rpx;background:#dcefe9}.intro-title{margin-top:24rpx;color:#17322d;font-size:34rpx;font-weight:800}.intro-note{max-width:560rpx;margin-top:12rpx;color:#71847f;font-size:23rpx;line-height:1.55}.actions{display:flex;flex-direction:column;gap:18rpx;padding:0 28rpx}.actions button{display:flex;align-items:center;gap:18rpx;height:auto;min-height:112rpx;margin:0;padding:20rpx 24rpx;border-radius:27rpx;text-align:left}.actions button::after{border:0}.actions button>view{display:flex;flex:1;flex-direction:column;gap:6rpx}.actions button text:first-child{font-size:27rpx;font-weight:750}.actions button text:last-child{font-size:21rpx;font-weight:400;opacity:.72}.wechat{background:#0b8d84;color:#f4fbf9}.phone{border:1rpx solid #d8e6e2;background:#f8fcfa;color:#1d3833}.phone[disabled]{background:#e8eeec;color:#8fa09c}.store-info{margin:26rpx 28rpx 0;padding:26rpx;border-radius:27rpx;background:#f8fcfa}.store-name{display:block;margin-bottom:18rpx;color:#1a3530;font-size:27rpx;font-weight:750}.store-info>view{display:flex;align-items:flex-start;gap:12rpx;margin-top:13rpx;color:#627670;font-size:22rpx;line-height:1.5}.store-info>view text{flex:1}.tip{display:flex;align-items:flex-start;gap:13rpx;margin:22rpx 28rpx 0;padding:22rpx 24rpx;border-radius:22rpx;background:#dff1ed;color:#57736d;font-size:22rpx;line-height:1.55}.tip text{flex:1}
</style>
