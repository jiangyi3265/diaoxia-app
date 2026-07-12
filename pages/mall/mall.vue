<template>
  <view class="page">
    <xy-header title="钓虾商城" variant="brand" :show-back="false" />
    <view class="wrap">
      <view v-if="loading" class="empty">正在加载商品…</view>
      <view v-else-if="products.length === 0" class="empty">暂无上架商品</view>
      <view v-else class="grid">
        <view v-for="product in products" :key="product.productId" class="product" @click="open(product)">
          <image v-if="product.coverUrl" :src="product.coverUrl" mode="aspectFill" /><view v-else class="placeholder">暂无图片</view>
          <text class="name">{{ product.productName }}</text><text class="category">{{ product.categoryName }}</text>
          <view class="price-row"><view><text class="price">¥{{ displayPrice(product) }}</text><text v-if="hasMemberDiscount(product)" class="origin">¥{{ product.salePrice }}</text><text v-if="hasMemberDiscount(product)" class="member-tag">会员价</text></view><text class="stock">库存 {{ product.stock }}</text></view>
        </view>
      </view>
    </view>
    <view class="xy-tabbar-hold"></view><xy-tabbar active="mall" />
  </view>
</template>
<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default {
  data() { return { products: [], loading: true } },
  onShow() { this.load() },
  methods: {
    async load() { this.loading = true; try { await ensureMemberSession(); this.products = await appRequest({ url: '/app/products' }) } catch (error) { showRequestError(error) } finally { this.loading = false } },
    displayPrice(product) { return product.memberPrice || product.salePrice },
    hasMemberDiscount(product) { return Number(product.memberDiscountAmount || 0) > 0 },
    open(product) { uni.navigateTo({ url: `/pages/mall/product?productId=${product.productId}` }) }
  }
}
</script>
<style scoped>
.page{min-height:100vh;background:var(--xy-bg)}.wrap{padding:24rpx}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20rpx}.product{overflow:hidden;border-radius:22rpx;background:#fff;box-shadow:var(--xy-shadow)}image,.placeholder{width:100%;height:230rpx}.placeholder{display:flex;align-items:center;justify-content:center;background:var(--xy-mint);color:var(--xy-muted)}.name,.category{display:block;padding:0 18rpx}.name{padding-top:18rpx;font-weight:700}.category,.stock{margin-top:8rpx;color:var(--xy-muted);font-size:22rpx}.price-row{display:flex;justify-content:space-between;align-items:flex-end;padding:18rpx}.price{color:var(--xy-danger);font-weight:700}.origin{margin-left:8rpx;color:var(--xy-muted);font-size:20rpx;text-decoration:line-through}.member-tag{display:block;width:max-content;margin-top:5rpx;padding:2rpx 8rpx;border-radius:8rpx;background:#fff1e8;color:#e66b2f;font-size:19rpx}.empty{padding:160rpx 0;text-align:center;color:var(--xy-muted)}</style>
