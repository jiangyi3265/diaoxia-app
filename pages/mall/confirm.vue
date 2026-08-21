<template>
  <view class="page">
    <xy-header title="确认订单" />
    <view class="content">
      <xy-state v-if="loading" type="loading" />
      <xy-state
        v-else-if="error"
        type="error"
        title="结算信息加载失败"
        :description="error"
        action-text="重新加载"
        @action="initialize"
      />
      <block v-else>
      <view class="payment-tip">
        <xy-icon name="info" :size="30" color="#0a8f84" />
        <view><text>{{ paymentMode === 'OFFLINE' ? '本单支持到店付款' : paymentMode === 'DEMO' ? '当前为演示支付' : '微信安全支付' }}</text><text>{{ paymentMode === 'OFFLINE' ? '提交订单后，再提交到店付款申请；门店确认收款后开始备货' : paymentMode === 'DEMO' ? '仅用于测试，不会产生真实扣款' : '订单创建后可完成在线支付' }}</text></view>
      </view>

      <view v-if="product" class="goods-row">
        <image v-if="product.coverUrl" :src="mediaUrl(product.coverUrl)" mode="aspectFill" @error="product.coverUrl = ''" />
        <view class="goods-copy"><text>{{ product.productName }}</text><text>{{ product.categoryName }} · 数量 {{ quantity }}</text></view>
        <text class="goods-price">¥{{ total }}</text>
      </view>

      <view class="section">
        <text class="section-title">配送方式</text>
        <view class="delivery-tabs">
          <view v-for="option in deliveryOptions" :key="option.value" :class="{ active: deliveryType === option.value }" @click="deliveryType = option.value">
            <xy-icon :name="option.icon" :size="30" :color="deliveryType === option.value ? '#087e76' : '#71827e'" />
            <text>{{ option.label }}</text>
          </view>
        </view>
      </view>

      <view v-if="deliveryType === 'DELIVERY'" class="address-row" @click="chooseAddress">
        <view class="address-icon"><xy-icon name="location" :size="34" color="#0a8f84" /></view>
        <view class="address-copy" v-if="address"><text>{{ address.receiverName }} {{ address.receiverMobile }}</text><text>{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</text></view>
        <view class="address-copy" v-else><text>请选择收货地址</text><text>配送订单需要完整地址</text></view>
        <xy-icon name="chevron-right" :size="29" color="#91a09d" />
      </view>
      <view v-else class="pickup-row">
        <view class="address-icon"><xy-icon name="bag" :size="34" color="#0a8f84" /></view>
        <view><text>到店自提</text><text>{{ paymentMode === 'OFFLINE' ? '提交订单后到店付款；具体自提门店由工作人员确认后通知' : '具体自提门店由工作人员确认后通知，完成付款后凭订单领取' }}</text></view>
      </view>

      <view class="amount-section">
        <view><text>商品金额</text><text>¥{{ originalTotal }}</text></view>
        <view v-if="hasMemberDiscount" class="discount"><text>会员优惠</text><text>-¥{{ discountTotal }}</text></view>
        <view><text>配送费</text><text>{{ deliveryType === 'PICKUP' ? '免配送费' : '¥0.00' }}</text></view>
        <view class="amount-total"><text>应付金额</text><text>¥{{ total }}</text></view>
      </view>
      <view class="bottom-space" />
      </block>
    </view>

    <view v-if="!loading && !error" class="submit-bar">
      <view><text>应付</text><text>¥{{ total }}</text></view>
      <button :disabled="!product || creating" @click="create">{{ creating ? '正在创建订单' : '提交订单' }}</button>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, publicRequest, resolveMediaUrl, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      productId: '', product: null, quantity: 1, address: null, deliveryType: 'PICKUP', creating: false,
      loading: true, error: '', paymentMode: 'OFFLINE',
      deliveryOptions: [
        { label: '到店自提', value: 'PICKUP', icon: 'bag' },
        { label: '配送到家', value: 'DELIVERY', icon: 'truck' }
      ]
    }
  },
  computed: {
    unitPrice() { return this.product ? Number(this.product.memberPrice || this.product.salePrice).toFixed(2) : '0.00' },
    total() { return (Number(this.unitPrice) * this.quantity).toFixed(2) },
    originalTotal() { return this.product ? (Number(this.product.salePrice) * this.quantity).toFixed(2) : '0.00' },
    discountTotal() { return (Number(this.originalTotal) - Number(this.total)).toFixed(2) },
    hasMemberDiscount() { return Number(this.discountTotal) > 0 }
  },
  onLoad(query) {
    this.productId = query.productId || ''
    this.quantity = Math.max(1, Number(query.quantity) || 1)
    this.initialize()
  },
  onShow() { if (this.product && !this.loading) this.refreshAddresses() },
  methods: {
    async initialize() {
      if (!this.productId) {
        this.loading = false
        this.error = '缺少商品信息，请返回商城重新选择'
        return
      }
      this.loading = true
      this.error = ''
      try {
        await ensureMemberSession()
        await Promise.all([this.loadProduct(), this.loadAddresses(), this.loadPaymentMode()])
        if (!this.product) throw new Error('商品已下架或暂不可购买')
      } catch (error) {
        this.product = null
        this.error = (error && error.message) || '暂时无法读取结算信息，请检查网络后重试'
      } finally {
        this.loading = false
      }
    },
    async loadPaymentMode() {
      try {
        const settings = await publicRequest({ url: '/app/payment-settings' })
        this.paymentMode = String(settings.mode || (settings.demoEnabled ? 'DEMO' : settings.wechatPayEnabled ? 'WECHAT' : 'OFFLINE')).toUpperCase()
      } catch (error) { this.paymentMode = 'OFFLINE' }
    },
    async loadProduct() { this.product = (await appRequest({ url: '/app/products', data: { productId: this.productId } }))[0] || null },
    async loadAddresses() {
      const list = await appRequest({ url: '/app/addresses' })
      const selectedId = uni.getStorageSync('xy.checkout.addressId')
      this.address = list.find(item => String(item.addressId) === String(selectedId)) || list.find(item => item.isDefault) || list[0] || null
    },
    async refreshAddresses() {
      try {
        await this.loadAddresses()
      } catch (error) {
        this.error = (error && error.message) || '收货地址刷新失败，请重试'
      }
    },
    chooseAddress() { uni.navigateTo({ url: '/pages/order/address?select=1' }) },
    mediaUrl(value) { return resolveMediaUrl(value) },
    async create() {
      if (!this.product || this.creating) return
      if (this.deliveryType === 'DELIVERY' && !this.address) return uni.showToast({ title: '请先选择收货地址', icon: 'none' })
      this.creating = true
      try {
        const order = await appRequest({
          url: '/app/orders', method: 'POST',
          data: { productId: this.product.productId, quantity: this.quantity, addressId: this.address && this.address.addressId, deliveryType: this.deliveryType }
        })
        uni.removeStorageSync('xy.checkout.addressId')
        uni.redirectTo({ url: `/pages/order/detail?orderNo=${order.orderNo}` })
      } catch (error) { showRequestError(error) } finally { this.creating = false }
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.content{padding:18rpx 26rpx}.payment-tip{display:flex;align-items:flex-start;gap:15rpx;margin-bottom:22rpx;padding:22rpx 24rpx;border:1rpx solid #cfe7e2;border-radius:22rpx;background:#ddf1ed}.payment-tip>view{display:flex;flex:1;flex-direction:column;gap:5rpx}.payment-tip text:first-child{color:#087e76;font-size:25rpx;font-weight:800}.payment-tip text:last-child{color:#5e7772;font-size:21rpx}.goods-row{display:flex;align-items:center;gap:20rpx;padding:24rpx;border-radius:28rpx;background:#f9fcfb}.goods-row image{width:126rpx;height:126rpx;border-radius:20rpx;background:#dbe8e5}.goods-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:12rpx}.goods-copy text:first-child{color:#1b2b28;font-size:29rpx;font-weight:800}.goods-copy text:last-child{color:#84938f;font-size:22rpx}.goods-price{color:#df594c;font-size:29rpx;font-weight:850}.section{margin-top:28rpx}.section-title{display:block;margin:0 4rpx 16rpx;color:#243532;font-size:27rpx;font-weight:800}.delivery-tabs{display:flex;gap:16rpx}.delivery-tabs>view{display:flex;flex:1;align-items:center;justify-content:center;gap:12rpx;height:88rpx;border:2rpx solid transparent;border-radius:22rpx;background:#f8fbfa;color:#667874;font-size:25rpx}.delivery-tabs>view.active{border-color:#85cfc7;background:#e5f5f2;color:#087e76;font-weight:750}.address-row,.pickup-row{display:flex;align-items:center;gap:18rpx;margin-top:20rpx;padding:26rpx;border-radius:26rpx;background:#f9fcfb}.address-icon{display:flex;align-items:center;justify-content:center;width:68rpx;height:68rpx;border-radius:22rpx;background:#e2f3ef}.address-copy,.pickup-row>view:last-child{display:flex;flex:1;min-width:0;flex-direction:column;gap:8rpx}.address-copy text:first-child,.pickup-row text:first-child{color:#263633;font-size:26rpx;font-weight:750}.address-copy text:last-child,.pickup-row text:last-child{color:#7c8e89;font-size:21rpx;line-height:1.5}.amount-section{margin-top:24rpx;padding:14rpx 26rpx;border-radius:28rpx;background:#f9fcfb}.amount-section>view{display:flex;align-items:center;justify-content:space-between;padding:16rpx 0;color:#667874;font-size:24rpx}.amount-section .discount text:last-child{color:#d9613d}.amount-section .amount-total{margin-top:8rpx;padding-top:23rpx;border-top:1rpx solid #e1eae8;color:#263633;font-weight:750}.amount-total text:last-child{color:#df594c;font-size:33rpx;font-weight:900}.bottom-space{height:145rpx}.submit-bar{position:fixed;z-index:10;right:0;bottom:0;left:0;display:flex;align-items:center;gap:24rpx;padding:18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom));background:#f8fbfa;box-shadow:0 -10rpx 30rpx rgba(23,73,68,.08)}.submit-bar>view{display:flex;flex:1;align-items:baseline;gap:9rpx}.submit-bar>view text:first-child{color:#70827e;font-size:23rpx}.submit-bar>view text:last-child{color:#df594c;font-size:34rpx;font-weight:900}.submit-bar button{width:310rpx;height:88rpx;border-radius:24rpx;background:#0b8d84;color:#f5fbf9;font-size:28rpx;font-weight:800;line-height:88rpx}.submit-bar button[disabled]{background:#b5c3c0}
</style>
