<template>
  <view class="page">
    <xy-header title="门店好物" variant="brand" :show-back="false" />
    <view class="intro">
      <view><text>到店选购</text><text>浏览实物介绍，到店确认购买</text></view>
      <view class="member-note"><xy-icon name="location" :size="27" color="#0a8f84" /><text>价格与库存以门店为准</text></view>
    </view>

    <scroll-view v-if="categories.length" class="category-scroll" scroll-x :show-scrollbar="false">
      <view class="category-list">
        <text v-for="item in categories" :key="item" :class="{ active: selectedCategory === item }" @click="selectedCategory = item">{{ item }}</text>
      </view>
    </scroll-view>

    <view class="content">
      <view v-if="loading" class="loading-list"><view v-for="i in 4" :key="i" /></view>
      <xy-state v-else-if="error" type="error" title="商品加载失败" :description="error" action-text="重新加载" @action="load" />
      <view v-else-if="filteredProducts.length === 0" class="empty-state"><xy-icon name="bag" :size="58" color="#0b756e" /><text>这个分类暂时没有商品</text></view>
      <view v-else class="grid">
        <view v-for="product in filteredProducts" :key="product.productId" class="product" @click="open(product)">
          <view class="media">
            <image v-if="product.coverUrl" :src="mediaUrl(product.coverUrl)" mode="aspectFit" @error="product.coverUrl = ''" />
            <view v-else class="placeholder"><xy-icon name="bag" :size="48" color="#7a918c" /></view>
          </view>
          <view class="product-copy">
            <text class="category">{{ product.categoryName }}</text>
            <text class="name">{{ product.productName }}</text>
            <view class="price-row"><view><text class="price-label">门店参考价</text><text class="price"><text>¥</text>{{ displayPrice(product) }}</text></view><text class="detail-link">查看详情</text></view>
          </view>
        </view>
      </view>
    </view>
    <view class="xy-tabbar-hold" /><xy-tabbar active="mall" />
  </view>
</template>

<script>
import { publicRequest, resolveMediaUrl } from '../../utils/api'

export default {
  data() { return { products: [], loading: true, error: '', selectedCategory: '全部' } },
  computed: {
    categories() { return ['全部', ...new Set(this.products.map(item => item.categoryName).filter(Boolean))] },
    filteredProducts() { return this.selectedCategory === '全部' ? this.products : this.products.filter(item => item.categoryName === this.selectedCategory) }
  },
  onShow() { this.load() },
  methods: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.products = await publicRequest({ url: '/app/products' })
        if (!this.products.length) {
          uni.reLaunch({ url: '/pages/store/store' })
          return
        }
      } catch (error) {
        this.error = (error && error.message) || '网络连接失败'
      } finally { this.loading = false }
    },
    displayPrice(product) { return Number(product.salePrice || 0).toFixed(2) },
    mediaUrl(value) { return resolveMediaUrl(value) },
    open(product) { uni.navigateTo({ url: `/pages/mall/product?productId=${product.productId}` }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.intro{display:flex;align-items:flex-end;justify-content:space-between;padding:31rpx 30rpx 26rpx}.intro>view:first-child{display:flex;flex-direction:column;gap:7rpx}.intro>view:first-child text:first-child{color:#192925;font-size:36rpx;font-weight:900}.intro>view:first-child text:last-child{color:#71847f;font-size:22rpx}.member-note{display:flex;align-items:center;gap:7rpx;padding:11rpx 14rpx;border-radius:17rpx;background:#dff2ee;color:#4c6d67;font-size:19rpx}.category-scroll{width:100%;white-space:nowrap}.category-list{display:flex;gap:14rpx;padding:0 30rpx 23rpx}.category-list text{display:inline-flex;align-items:center;height:62rpx;padding:0 24rpx;border-radius:20rpx;background:#e5ecea;color:#667a75;font-size:23rpx}.category-list text.active{background:#0b8d84;color:#f4fbf9;font-weight:750}.content{padding:0 26rpx}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18rpx}.product{overflow:hidden;border-radius:26rpx;background:#f9fcfb}.media{position:relative;height:245rpx;overflow:hidden;background:#edf3f1}.media image,.placeholder{width:100%;height:100%}.placeholder{display:flex;align-items:center;justify-content:center;background:#dde9e6}.product-copy{padding:18rpx 18rpx 20rpx}.category{display:block;color:#78908a;font-size:19rpx}.name{display:-webkit-box;min-height:70rpx;margin-top:7rpx;overflow:hidden;color:#1c2c29;font-size:27rpx;font-weight:800;line-height:1.35;-webkit-box-orient:vertical;-webkit-line-clamp:2}.price-row{display:flex;align-items:flex-end;justify-content:space-between;margin-top:15rpx}.price-label{display:block;margin-bottom:3rpx;color:#84958f;font-size:17rpx}.price{color:#d85d4f;font-size:30rpx;font-weight:900}.price>text{font-size:19rpx}.detail-link{color:#0b756e;font-size:19rpx;font-weight:700}.loading-list{display:grid;grid-template-columns:repeat(2,1fr);gap:18rpx}.loading-list view{height:390rpx;border-radius:26rpx;background:#dfeae7}.empty-state{display:flex;flex-direction:column;align-items:center;gap:20rpx;padding:150rpx 30rpx;color:#71847f;font-size:24rpx}
</style>
