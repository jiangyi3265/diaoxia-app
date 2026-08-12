<template>
  <view class="page">
    <xy-header title="联系客服" />
    <view class="intro">
      <view class="intro-icon"><xy-icon name="headset" :size="54" color="#0b756e" /></view>
      <text class="intro-title">需要帮助？我们在这里</text>
      <text class="intro-note">预约、会员、商城与退款问题都可以联系我们。</text>
    </view>

    <view class="actions primary-actions">
      <button class="wechat" open-type="contact">
        <xy-icon name="chat" :size="38" color="#f4fbf9" />
        <view><text>微信客服</text><text>在线咨询，发送订单或预约信息</text></view>
        <xy-icon name="chevron-right" :size="30" color="#c9ebe6" />
      </button>
    </view>

    <xy-state v-if="loading" type="loading" />
    <xy-state
      v-else-if="error"
      type="error"
      title="门店联系方式加载失败"
      :description="error"
      action-text="重新加载"
      @action="load"
    />
    <block v-else>
      <view v-if="stores.length > 1" class="store-selector">
        <text class="selector-title">选择联系门店</text>
        <scroll-view scroll-x class="store-scroll" :show-scrollbar="false">
          <view class="store-options">
            <view
              v-for="item in stores"
              :key="item.storeId"
              class="store-option"
              :class="{ active: String(item.storeId) === String(storeId) }"
              @click="storeId = item.storeId"
            >{{ item.storeName }}</view>
          </view>
        </scroll-view>
      </view>

      <view class="actions store-actions">
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
      <xy-state v-else type="empty" title="暂无可联系门店" description="门店联系方式正在完善，请先使用微信客服。" />
    </block>
    <view class="tip"><xy-icon name="info" :size="28" color="#0a8f84" /><text>退款申请请从“我的订单”进入对应订单提交，客服会协助查看处理进度。</text></view>
    <view class="legal"><text @click="openLegal('terms')">用户服务协议</text><text>·</text><text @click="openLegal('privacy')">隐私政策</text></view>
  </view>
</template>

<script>
import { publicRequest } from '../../utils/api'

export default {
  data() { return { stores: [], storeId: '', loading: true, error: '' } },
  computed: {
    store() { return this.stores.find((item) => String(item.storeId) === String(this.storeId)) || this.stores[0] || {} }
  },
  onLoad() { this.load() },
  methods: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.stores = await publicRequest({ url: '/app/stores' })
        if (!this.storeId && this.stores.length) this.storeId = this.stores[0].storeId
      } catch (error) {
        this.stores = []
        this.error = (error && error.message) || '暂时无法读取门店联系方式，请检查网络后重试'
      } finally { this.loading = false }
    },
    callStore() { if (this.store.phone) uni.makePhoneCall({ phoneNumber: this.store.phone }) },
    openLegal(page) { uni.navigateTo({ url: `/pages/legal/${page}` }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3;padding-bottom:50rpx}.intro{display:flex;flex-direction:column;align-items:center;padding:58rpx 36rpx 42rpx;text-align:center}.intro-icon{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:34rpx;background:#dcefe9}.intro-title{margin-top:24rpx;color:#17322d;font-size:34rpx;font-weight:800}.intro-note{max-width:560rpx;margin-top:12rpx;color:#71847f;font-size:23rpx;line-height:1.55}.actions{display:flex;flex-direction:column;gap:18rpx;padding:0 28rpx}.store-actions{margin-top:18rpx}.actions button{display:flex;align-items:center;gap:18rpx;height:auto;min-height:112rpx;margin:0;padding:20rpx 24rpx;border-radius:27rpx;text-align:left}.actions button::after{border:0}.actions button>view{display:flex;flex:1;flex-direction:column;gap:6rpx}.actions button text:first-child{font-size:27rpx;font-weight:750}.actions button text:last-child{font-size:21rpx;font-weight:400;opacity:.72}.wechat{background:#0b8d84;color:#f4fbf9}.phone{border:1rpx solid #d8e6e2;background:#f8fcfa;color:#1d3833}.phone[disabled]{background:#e8eeec;color:#8fa09c}.store-selector{margin-top:24rpx}.selector-title{display:block;margin:0 32rpx 14rpx;color:#465f5a;font-size:22rpx;font-weight:650}.store-scroll{width:100%;white-space:nowrap}.store-options{display:inline-flex;gap:14rpx;padding:0 28rpx 6rpx}.store-option{display:flex;align-items:center;height:66rpx;padding:0 24rpx;border:1rpx solid #d4e4e0;border-radius:22rpx;background:#f8fcfa;color:#617772;font-size:23rpx}.store-option.active{border-color:#0b8d84;background:#dcefe9;color:#086d66;font-weight:700}.store-info{margin:26rpx 28rpx 0;padding:26rpx;border-radius:27rpx;background:#f8fcfa}.store-name{display:block;margin-bottom:18rpx;color:#1a3530;font-size:27rpx;font-weight:750}.store-info>view{display:flex;align-items:flex-start;gap:12rpx;margin-top:13rpx;color:#627670;font-size:22rpx;line-height:1.5}.store-info>view text{flex:1}.tip{display:flex;align-items:flex-start;gap:13rpx;margin:22rpx 28rpx 0;padding:22rpx 24rpx;border-radius:22rpx;background:#dff1ed;color:#57736d;font-size:22rpx;line-height:1.55}.tip text{flex:1}
.legal{display:flex;align-items:center;justify-content:center;gap:14rpx;margin-top:28rpx;color:#7d908b;font-size:20rpx}.legal text:first-child,.legal text:last-child{color:#587972}
</style>
