<template>
  <view class="page">
    <xy-header title="门店信息" />
    <view class="hero">
      <image src="/static/img/store2.jpg" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="hero-copy"><text>钓虾生活馆</text><text>舒适钓位、轻松聚会，等你到店</text></view>
    </view>

    <view class="content">
      <view class="section-head"><text>营业门店</text><text>共 {{ stores.length }} 家</text></view>
      <view v-for="store in stores" :key="store.storeId" class="store-row">
        <view class="store-top">
          <view><text class="store-name">{{ store.storeName }}</text><text class="open-tag">营业中</text></view>
          <text class="hours">{{ store.businessHours || '营业时间待更新' }}</text>
        </view>
        <view class="meta"><xy-icon name="location" :size="28" color="#6d817c" /><text>{{ store.address || '门店地址待更新' }}</text></view>
        <view v-if="store.phone" class="meta"><xy-icon name="phone" :size="28" color="#6d817c" /><text>{{ store.phone }}</text></view>
        <view class="actions">
          <button v-if="store.phone" @click="call(store.phone)"><xy-icon name="phone" :size="28" color="#0a8f84" /><text>联系门店</text></button>
          <button :disabled="!store.latitude || !store.longitude" @click="nav(store)"><xy-icon name="map-pin-nav" :size="28" :color="store.latitude && store.longitude ? '#f4fbf9' : '#9eadaa'" /><text>地图导航</text></button>
        </view>
      </view>

      <view v-if="!stores.length" class="empty-state">
        <view><xy-icon name="location" :size="58" color="#0b756e" /></view>
        <text>暂无营业门店</text><text>门店信息更新后会第一时间显示在这里</text>
      </view>

      <view class="notice"><xy-icon name="info" :size="28" color="#0a8f84" /><text>节假日营业时间可能调整，出发前建议先联系门店。</text></view>
    </view>
  </view>
</template>

<script>
import { publicRequest, showRequestError } from '../../utils/api'

export default {
  data() { return { stores: [] } },
  onLoad() { this.load() },
  methods: {
    async load() { try { this.stores = await publicRequest({ url: '/app/stores' }) } catch (error) { showRequestError(error) } },
    call(phone) { if (phone) uni.makePhoneCall({ phoneNumber: phone }) },
    nav(store) { if (!store.latitude || !store.longitude) return; uni.openLocation({ latitude: Number(store.latitude), longitude: Number(store.longitude), name: store.storeName, address: store.address }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.hero{position:relative;overflow:hidden;height:320rpx;margin:14rpx 26rpx 0;border-radius:32rpx;background:#345b55}.hero image{width:100%;height:100%}.hero-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,42,38,.05),rgba(20,42,38,.76))}.hero-copy{position:absolute;right:28rpx;bottom:26rpx;left:28rpx;display:flex;flex-direction:column;gap:8rpx;color:#f3fbf8}.hero-copy text:first-child{font-size:34rpx;font-weight:850}.hero-copy text:last-child{font-size:22rpx;opacity:.82}.content{padding:28rpx 26rpx 50rpx}.section-head{display:flex;align-items:center;justify-content:space-between;margin:0 4rpx 18rpx}.section-head text:first-child{color:#21312e;font-size:29rpx;font-weight:850}.section-head text:last-child{color:#82928e;font-size:21rpx}.store-row{margin-bottom:18rpx;padding:28rpx;border-radius:28rpx;background:#f9fcfb}.store-top{display:flex;align-items:flex-start;justify-content:space-between;gap:22rpx}.store-top>view{display:flex;align-items:center;gap:12rpx}.store-name{color:#192925;font-size:30rpx;font-weight:850}.open-tag{padding:5rpx 10rpx;border-radius:11rpx;background:#daf1eb;color:#0a8f84;font-size:18rpx}.hours{color:#6c7f7a;font-size:22rpx}.meta{display:flex;align-items:flex-start;gap:12rpx;margin-top:18rpx;color:#60736f;font-size:23rpx;line-height:1.5}.meta text{flex:1}.actions{display:flex;gap:14rpx;margin-top:25rpx}.actions button{display:flex;flex:1;align-items:center;justify-content:center;gap:9rpx;height:78rpx;border-radius:21rpx;background:#e3f3f0;color:#0a8f84;font-size:24rpx;font-weight:750;line-height:78rpx}.actions button:last-child{background:#0b8d84;color:#f4fbf9}.actions button[disabled]{background:#e8eeec;color:#9eadaa}.notice{display:flex;align-items:flex-start;gap:13rpx;margin-top:24rpx;padding:22rpx 24rpx;border-radius:22rpx;background:#dff1ed;color:#57736d;font-size:22rpx;line-height:1.55}.notice text{flex:1}.empty-state{display:flex;flex-direction:column;align-items:center;padding:100rpx 40rpx;text-align:center}.empty-state>view{display:flex;align-items:center;justify-content:center;width:106rpx;height:106rpx;border-radius:34rpx;background:#dcefe9}.empty-state>text:nth-child(2){margin-top:22rpx;font-size:29rpx;font-weight:800}.empty-state>text:last-child{margin-top:10rpx;color:#7b8e89;font-size:22rpx}
</style>
