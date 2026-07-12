<template>
  <view class="page"><xy-header title="商品详情" />
    <view v-if="product" class="wrap">
      <image v-if="product.coverUrl" class="cover" :src="product.coverUrl" mode="aspectFill" />
      <view class="card"><text class="name">{{ product.productName }}</text><view class="price-line"><text class="price">¥{{ displayPrice }}</text><text v-if="hasMemberDiscount" class="origin">¥{{ product.salePrice }}</text><text v-if="hasMemberDiscount" class="member-tag">会员已优惠 ¥{{ product.memberDiscountAmount }}</text></view><text class="stock">库存 {{ product.stock }}</text><text class="detail">{{ product.detailText || '暂无商品详情' }}</text></view>
      <view class="quantity"><text>购买数量</text><view><button @click="quantity = Math.max(1, quantity - 1)">−</button><text>{{ quantity }}</text><button @click="quantity = Math.min(product.stock, quantity + 1)">+</button></view></view>
      <button class="buy" :disabled="product.stock < 1" @click="buy">立即购买</button>
    </view><view v-else class="empty">商品不存在或已下架</view>
  </view>
</template>
<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default {
  data() { return { product: null, quantity: 1 } },
  computed: { displayPrice() { return this.product ? (this.product.memberPrice || this.product.salePrice) : '0.00' }, hasMemberDiscount() { return this.product && Number(this.product.memberDiscountAmount || 0) > 0 } },
  onLoad(query) { this.load(query.productId) },
  methods: { async load(productId) { try { await ensureMemberSession(); const list = await appRequest({ url: '/app/products', data: { productId } }); this.product = list[0] || null } catch (error) { showRequestError(error) } }, buy() { uni.navigateTo({ url: `/pages/mall/confirm?productId=${this.product.productId}&quantity=${this.quantity}` }) } }
}
</script>
<style scoped>.page{min-height:100vh;background:var(--xy-bg)}.wrap{padding:24rpx}.cover{width:100%;height:520rpx;border-radius:24rpx;background:var(--xy-mint)}.card,.quantity{margin-top:20rpx;padding:28rpx;border-radius:22rpx;background:#fff}.name,.detail{display:block}.name{font-size:36rpx;font-weight:700}.price-line{display:flex;align-items:baseline;gap:12rpx;margin-top:18rpx}.price{color:var(--xy-danger);font-size:40rpx;font-weight:700}.origin{color:var(--xy-muted);font-size:24rpx;text-decoration:line-through}.member-tag{padding:4rpx 10rpx;border-radius:8rpx;background:#fff1e8;color:#e66b2f;font-size:20rpx}.stock{color:var(--xy-muted);font-size:23rpx}.detail{margin-top:24rpx;line-height:1.7;color:var(--xy-ink-2)}.quantity{display:flex;justify-content:space-between}.quantity view{display:flex;gap:24rpx;align-items:center}.quantity button{width:52rpx;height:52rpx;background:var(--xy-mint)}.buy{margin-top:28rpx;background:var(--xy-primary);color:#fff}.empty{padding:180rpx 0;text-align:center;color:var(--xy-muted)}</style>
