<template>
  <view class="page">
    <xy-header title="商品详情" />
    <view v-if="loading" class="content"><xy-state type="loading" /></view>
    <xy-state v-else-if="error" type="error" title="商品详情加载失败" :description="error" action-text="重新加载" @action="load(productId)" />
    <view v-else-if="product" class="content">
      <view class="media">
        <image v-if="product.coverUrl" :src="mediaUrl(product.coverUrl)" mode="aspectFit" @error="product.coverUrl = ''" />
        <view v-else class="media-empty"><xy-icon name="bag" :size="68" color="#78918c" /></view>
        <text class="category">{{ product.categoryName || '精选好物' }}</text>
      </view>

      <view class="summary">
        <view class="title-row">
          <text class="name">{{ product.productName }}</text>
        </view>
        <view class="price-row">
          <text class="price-label">门店参考价</text>
          <text class="price"><text>¥</text>{{ displayPrice }}</text>
        </view>
      </view>

      <view class="service-line">
        <view><xy-icon name="check" :size="25" color="#0c9589" /><text>实物展示</text></view>
        <view><xy-icon name="check" :size="25" color="#0c9589" /><text>到店选购</text></view>
        <view><xy-icon name="check" :size="25" color="#0c9589" /><text>库存请咨询</text></view>
      </view>

      <view class="detail-section">
        <text class="section-title">商品说明</text>
        <text class="detail">{{ product.detailText || '暂无商品详情' }}</text>
      </view>

      <view class="visit-note">
        <view><xy-icon name="location" :size="34" color="#0b756e" /></view>
        <view><text>仅支持到店购买</text><text>小程序只展示商品信息，不提供线上下单、收款或配送。价格和库存请以门店现场为准。</text></view>
      </view>
      <view class="bottom-space" />
    </view>

    <view v-else class="empty-state">
      <view><xy-icon name="bag" :size="58" color="#0b756e" /></view>
      <text>商品不存在或已下架</text>
    </view>

    <view v-if="product" class="visit-bar">
      <view class="bar-copy"><text>购买方式</text><text>到店看实物后购买</text></view>
      <button @click="visitStore">查看门店</button>
    </view>
  </view>
</template>

<script>
import { publicRequest, resolveMediaUrl } from '../../utils/api'

export default {
  data() { return { product: null, productId: '', loading: true, error: '' } },
  computed: {
    displayPrice() { return this.product ? Number(this.product.salePrice || 0).toFixed(2) : '0.00' }
  },
  onLoad(query) { this.productId = String(query.productId || ''); this.load(this.productId) },
  methods: {
    async load(productId) {
      this.loading = true
      this.error = ''
      try {
        const list = await publicRequest({ url: '/app/products', data: { productId } })
        this.product = list[0] || null
      } catch (error) { this.error = (error && error.message) || '网络连接失败' }
      finally { this.loading = false }
    },
    mediaUrl(value) { return resolveMediaUrl(value) },
    visitStore() { uni.reLaunch({ url: '/pages/store/store' }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.content{padding:14rpx 26rpx 0}.media{position:relative;overflow:hidden;height:510rpx;border-radius:32rpx;background:#edf3f1}.media image,.media-empty{width:100%;height:100%}.media-empty{display:flex;align-items:center;justify-content:center}.category{position:absolute;top:22rpx;left:22rpx;padding:9rpx 17rpx;border-radius:18rpx;background:rgba(20,39,35,.72);color:#f4fbf9;font-size:21rpx}.summary{padding:32rpx 8rpx 28rpx}.title-row{display:flex;align-items:flex-start;gap:24rpx}.name{flex:1;color:#172622;font-size:38rpx;font-weight:800;line-height:1.3}.price-row{display:flex;align-items:baseline;gap:14rpx;margin-top:20rpx}.price-label{color:#758883;font-size:21rpx}.price{color:#d85d4f;font-size:43rpx;font-weight:900}.price>text{font-size:24rpx}.service-line{display:flex;justify-content:space-between;padding:24rpx 6rpx;border-top:1rpx solid #dbe6e3;border-bottom:1rpx solid #dbe6e3}.service-line view{display:flex;align-items:center;gap:5rpx;color:#59706b;font-size:20rpx}.detail-section{padding:32rpx 8rpx}.section-title{display:block;color:#20302d;font-size:28rpx;font-weight:800}.detail{display:block;margin-top:16rpx;color:#617470;font-size:25rpx;line-height:1.75;white-space:pre-line}.visit-note{display:flex;align-items:flex-start;gap:17rpx;padding:25rpx 24rpx;border:1rpx solid #d2e6e1;border-radius:24rpx;background:#e7f4f1}.visit-note>view:first-child{display:flex;align-items:center;justify-content:center;width:58rpx;height:58rpx;border-radius:18rpx;background:#d2ebe5}.visit-note>view:last-child{display:flex;flex:1;flex-direction:column;gap:8rpx}.visit-note>view:last-child text:first-child{color:#1e4840;font-size:25rpx;font-weight:750}.visit-note>view:last-child text:last-child{color:#617b74;font-size:21rpx;line-height:1.55}.bottom-space{height:150rpx}.visit-bar{position:fixed;z-index:10;right:0;bottom:0;left:0;display:flex;align-items:center;gap:26rpx;padding:18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom));background:#f8fbfa;box-shadow:0 -10rpx 30rpx rgba(23,73,68,.08)}.bar-copy{display:flex;flex:1;flex-direction:column;gap:5rpx}.bar-copy text:first-child{color:#84938f;font-size:20rpx}.bar-copy text:last-child{color:#29423d;font-size:24rpx;font-weight:700}.visit-bar button{width:280rpx;height:88rpx;border-radius:24rpx;background:#0b8d84;color:#f4fbf9;font-size:27rpx;font-weight:800;line-height:88rpx}.empty-state{display:flex;flex-direction:column;align-items:center;padding:160rpx 40rpx;color:#738783}.empty-state view{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:34rpx;background:#dcefe9}.empty-state text{margin-top:24rpx}
</style>
