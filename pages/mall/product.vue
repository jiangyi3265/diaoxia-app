<template>
  <view class="page">
    <xy-header title="商品详情" />
    <view v-if="product" class="content">
      <view class="media">
        <image v-if="product.coverUrl" :src="product.coverUrl" mode="aspectFill" />
        <view v-else class="media-empty"><xy-icon name="bag" :size="68" color="#78918c" /></view>
        <text class="category">{{ product.categoryName || '精选好物' }}</text>
      </view>

      <view class="summary">
        <view class="title-row">
          <text class="name">{{ product.productName }}</text>
          <text class="stock">库存 {{ product.stock }}</text>
        </view>
        <view class="price-row">
          <text class="price"><text>¥</text>{{ displayPrice }}</text>
          <text v-if="hasMemberDiscount" class="origin">¥{{ product.salePrice }}</text>
          <text v-if="hasMemberDiscount" class="member-tag">会员省 ¥{{ product.memberDiscountAmount }}</text>
          <text v-else-if="discountExcluded" class="plain-tag">不参与会员折扣</text>
        </view>
      </view>

      <view class="service-line">
        <view><xy-icon name="check" :size="25" color="#0c9589" /><text>品质精选</text></view>
        <view><xy-icon name="check" :size="25" color="#0c9589" /><text>库存实时更新</text></view>
        <view><xy-icon name="check" :size="25" color="#0c9589" /><text>支持到店自提</text></view>
      </view>

      <view class="detail-section">
        <text class="section-title">商品说明</text>
        <text class="detail">{{ product.detailText || '暂无商品详情' }}</text>
      </view>

      <view class="quantity-row">
        <view><text class="section-title">购买数量</text><text class="quantity-note">每次最多购买 {{ product.stock }} 件</text></view>
        <view class="stepper">
          <button :disabled="quantity <= 1" @click="quantity = Math.max(1, quantity - 1)">−</button>
          <text>{{ quantity }}</text>
          <button :disabled="quantity >= product.stock" @click="quantity = Math.min(product.stock, quantity + 1)">+</button>
        </view>
      </view>
      <view class="bottom-space" />
    </view>

    <view v-else class="empty-state">
      <view><xy-icon name="bag" :size="58" color="#0b756e" /></view>
      <text>商品不存在或已下架</text>
    </view>

    <view v-if="product" class="purchase-bar">
      <view class="bar-price"><text>合计</text><text>¥{{ totalPrice }}</text></view>
      <button :disabled="product.stock < 1" @click="buy">{{ product.stock < 1 ? '暂时缺货' : '立即购买' }}</button>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() { return { product: null, quantity: 1 } },
  computed: {
    displayPrice() { return this.product ? Number(this.product.memberPrice || this.product.salePrice).toFixed(2) : '0.00' },
    totalPrice() { return (Number(this.displayPrice) * this.quantity).toFixed(2) },
    hasMemberDiscount() { return this.product && Number(this.product.memberDiscountAmount || 0) > 0 },
    discountExcluded() { return this.product && (this.product.memberDiscountEligible === false || Number(this.product.memberDiscountEnabled) === 0) }
  },
  onLoad(query) { this.load(query.productId) },
  methods: {
    async load(productId) {
      try {
        await ensureMemberSession()
        const list = await appRequest({ url: '/app/products', data: { productId } })
        this.product = list[0] || null
      } catch (error) { showRequestError(error) }
    },
    buy() { uni.navigateTo({ url: `/pages/mall/confirm?productId=${this.product.productId}&quantity=${this.quantity}` }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.content{padding:14rpx 26rpx 0}.media{position:relative;overflow:hidden;height:510rpx;border-radius:32rpx;background:#dce9e6}.media image,.media-empty{width:100%;height:100%}.media-empty{display:flex;align-items:center;justify-content:center}.category{position:absolute;top:22rpx;left:22rpx;padding:9rpx 17rpx;border-radius:18rpx;background:rgba(20,39,35,.72);color:#f4fbf9;font-size:21rpx}.summary{padding:32rpx 8rpx 28rpx}.title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24rpx}.name{flex:1;color:#172622;font-size:38rpx;font-weight:800;line-height:1.3}.stock{margin-top:7rpx;color:#80918d;font-size:22rpx}.price-row{display:flex;align-items:center;gap:13rpx;margin-top:20rpx}.price{color:#df594c;font-size:43rpx;font-weight:900}.price>text{font-size:24rpx}.origin{color:#94a29f;font-size:23rpx;text-decoration:line-through}.member-tag,.plain-tag{padding:6rpx 12rpx;border-radius:12rpx;font-size:20rpx;font-weight:650}.member-tag{background:#fff0e7;color:#d96235}.plain-tag{background:#e5ecea;color:#647773}.service-line{display:flex;justify-content:space-between;padding:24rpx 6rpx;border-top:1rpx solid #dbe6e3;border-bottom:1rpx solid #dbe6e3}.service-line view{display:flex;align-items:center;gap:5rpx;color:#59706b;font-size:20rpx}.detail-section{padding:32rpx 8rpx}.section-title{display:block;color:#20302d;font-size:28rpx;font-weight:800}.detail{display:block;margin-top:16rpx;color:#617470;font-size:25rpx;line-height:1.75}.quantity-row{display:flex;align-items:center;justify-content:space-between;padding:28rpx;border-radius:26rpx;background:#f8fbfa}.quantity-note{display:block;margin-top:8rpx;color:#8a9996;font-size:20rpx}.stepper{display:flex;align-items:center;overflow:hidden;border:1rpx solid #d8e4e1;border-radius:18rpx;background:#fff}.stepper button{width:66rpx;height:62rpx;color:#0b756e;font-size:31rpx;line-height:62rpx}.stepper button[disabled]{color:#b7c3c0}.stepper text{width:62rpx;text-align:center;color:#273633;font-weight:700}.bottom-space{height:150rpx}.purchase-bar{position:fixed;z-index:10;right:0;bottom:0;left:0;display:flex;align-items:center;gap:26rpx;padding:18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom));background:#f8fbfa;box-shadow:0 -10rpx 30rpx rgba(23,73,68,.08)}.bar-price{display:flex;flex:1;flex-direction:column}.bar-price text:first-child{color:#84938f;font-size:20rpx}.bar-price text:last-child{margin-top:3rpx;color:#df594c;font-size:33rpx;font-weight:850}.purchase-bar button{width:330rpx;height:88rpx;border-radius:24rpx;background:#0b8d84;color:#f4fbf9;font-size:28rpx;font-weight:800;line-height:88rpx}.purchase-bar button[disabled]{background:#afbfbc}.empty-state{display:flex;flex-direction:column;align-items:center;padding:160rpx 40rpx;color:#738783}.empty-state view{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:34rpx;background:#dcefe9}.empty-state text{margin-top:24rpx}
</style>
