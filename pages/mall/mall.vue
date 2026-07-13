<template>
  <view class="page">
    <xy-header title="钓虾商城" variant="brand" :show-back="false" />
    <view class="intro">
      <view><text>到店好物</text><text>装备、加购与分享美食</text></view>
      <view class="member-note"><xy-icon name="card" :size="27" color="#0a8f84" /><text>会员商品自动显示专享价</text></view>
    </view>

    <scroll-view v-if="categories.length" class="category-scroll" scroll-x :show-scrollbar="false">
      <view class="category-list">
        <text v-for="item in categories" :key="item" :class="{ active: selectedCategory === item }" @click="selectedCategory = item">{{ item }}</text>
      </view>
    </scroll-view>

    <view class="content">
      <view v-if="loading" class="loading-list"><view v-for="i in 4" :key="i" /></view>
      <view v-else-if="filteredProducts.length === 0" class="empty-state"><xy-icon name="bag" :size="58" color="#0b756e" /><text>这个分类暂时没有商品</text></view>
      <view v-else class="grid">
        <view v-for="product in filteredProducts" :key="product.productId" class="product" @click="open(product)">
          <view class="media">
            <image v-if="product.coverUrl" :src="product.coverUrl" mode="aspectFill" />
            <view v-else class="placeholder"><xy-icon name="bag" :size="48" color="#7a918c" /></view>
            <text v-if="hasMemberDiscount(product)" class="discount-badge">会员价</text>
          </view>
          <view class="product-copy">
            <text class="category">{{ product.categoryName }}</text>
            <text class="name">{{ product.productName }}</text>
            <view class="price-row"><view><text class="price"><text>¥</text>{{ displayPrice(product) }}</text><text v-if="hasMemberDiscount(product)" class="origin">¥{{ product.salePrice }}</text></view><text class="stock">余 {{ product.stock }}</text></view>
          </view>
        </view>
      </view>
    </view>
    <view class="xy-tabbar-hold" /><xy-tabbar active="mall" />
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() { return { products: [], loading: true, selectedCategory: '全部' } },
  computed: {
    categories() { return ['全部', ...new Set(this.products.map(item => item.categoryName).filter(Boolean))] },
    filteredProducts() { return this.selectedCategory === '全部' ? this.products : this.products.filter(item => item.categoryName === this.selectedCategory) }
  },
  onShow() { this.load() },
  methods: {
    async load() { this.loading = true; try { await ensureMemberSession(); this.products = await appRequest({ url: '/app/products' }) } catch (error) { showRequestError(error) } finally { this.loading = false } },
    displayPrice(product) { return Number(product.memberPrice || product.salePrice).toFixed(2) },
    hasMemberDiscount(product) { return Number(product.memberDiscountAmount || 0) > 0 },
    open(product) { uni.navigateTo({ url: `/pages/mall/product?productId=${product.productId}` }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.intro{display:flex;align-items:flex-end;justify-content:space-between;padding:31rpx 30rpx 26rpx}.intro>view:first-child{display:flex;flex-direction:column;gap:7rpx}.intro>view:first-child text:first-child{color:#192925;font-size:36rpx;font-weight:900}.intro>view:first-child text:last-child{color:#71847f;font-size:22rpx}.member-note{display:flex;align-items:center;gap:7rpx;padding:11rpx 14rpx;border-radius:17rpx;background:#dff2ee;color:#4c6d67;font-size:19rpx}.category-scroll{width:100%;white-space:nowrap}.category-list{display:flex;gap:14rpx;padding:0 30rpx 23rpx}.category-list text{display:inline-flex;align-items:center;height:62rpx;padding:0 24rpx;border-radius:20rpx;background:#e5ecea;color:#667a75;font-size:23rpx}.category-list text.active{background:#0b8d84;color:#f4fbf9;font-weight:750}.content{padding:0 26rpx}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18rpx}.product{overflow:hidden;border-radius:26rpx;background:#f9fcfb}.media{position:relative;height:245rpx;overflow:hidden}.media image,.placeholder{width:100%;height:100%}.placeholder{display:flex;align-items:center;justify-content:center;background:#dde9e6}.discount-badge{position:absolute;top:14rpx;left:14rpx;padding:7rpx 12rpx;border-radius:13rpx;background:#173c37;color:#f3fbf8;font-size:18rpx;font-weight:700}.product-copy{padding:18rpx 18rpx 20rpx}.category{display:block;color:#78908a;font-size:19rpx}.name{display:-webkit-box;min-height:70rpx;margin-top:7rpx;overflow:hidden;color:#1c2c29;font-size:27rpx;font-weight:800;line-height:1.35;-webkit-box-orient:vertical;-webkit-line-clamp:2}.price-row{display:flex;align-items:flex-end;justify-content:space-between;margin-top:15rpx}.price{color:#df594c;font-size:30rpx;font-weight:900}.price>text{font-size:19rpx}.origin{display:block;margin-top:2rpx;color:#97a39f;font-size:18rpx;text-decoration:line-through}.stock{color:#8a9995;font-size:19rpx}.loading-list{display:grid;grid-template-columns:repeat(2,1fr);gap:18rpx}.loading-list view{height:390rpx;border-radius:26rpx;background:#dfeae7}.empty-state{display:flex;flex-direction:column;align-items:center;gap:20rpx;padding:150rpx 30rpx;color:#71847f;font-size:24rpx}
</style>
