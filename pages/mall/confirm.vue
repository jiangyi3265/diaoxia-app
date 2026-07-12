<template>
  <view class="page"><xy-header title="确认订单" /><view class="wrap">
    <view v-if="product" class="card product-card"><view><text>{{ product.productName }}</text><text class="muted">¥{{ unitPrice }} × {{ quantity }}</text></view><view class="right"><text v-if="hasMemberDiscount" class="origin">¥{{ originalTotal }}</text><text class="price">¥{{ total }}</text><text v-if="hasMemberDiscount" class="discount">会员已优惠 ¥{{ discountTotal }}</text></view></view>
    <view class="card" @click="chooseAddress"><text>收货地址</text><text class="muted">{{ address ? `${address.receiverName} ${address.receiverMobile} ${address.province}${address.city}${address.district}${address.detail}` : '请选择收货地址' }}</text></view>
    <view class="card"><text>配送方式</text><picker :range="deliveryOptions" range-key="label" @change="deliveryType = deliveryOptions[$event.detail.value].value"><view>{{ deliveryOptions.find(item => item.value === deliveryType).label }}</view></picker></view>
    <view class="total"><view v-if="hasMemberDiscount" class="discount-row">会员优惠 <text>-¥{{ discountTotal }}</text></view><view>应付金额 <text>¥{{ total }}</text></view></view>
    <button class="submit" :disabled="!product || creating" @click="create">{{ creating ? '创建中…' : '提交订单' }}</button>
  </view></view>
</template>
<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default {
  data() { return { product: null, quantity: 1, address: null, deliveryType: 'PICKUP', deliveryOptions: [{ label: '到店自提', value: 'PICKUP' }, { label: '配送到家', value: 'DELIVERY' }], creating: false } },
  computed: {
    unitPrice() { return this.product ? Number(this.product.memberPrice || this.product.salePrice).toFixed(2) : '0.00' },
    total() { return (Number(this.unitPrice) * this.quantity).toFixed(2) },
    originalTotal() { return this.product ? (Number(this.product.salePrice) * this.quantity).toFixed(2) : '0.00' },
    discountTotal() { return (Number(this.originalTotal) - Number(this.total)).toFixed(2) },
    hasMemberDiscount() { return Number(this.discountTotal) > 0 }
  },
  onLoad(query) { this.quantity = Math.max(1, Number(query.quantity) || 1); this.initialize(query.productId) },
  methods: {
    async initialize(productId) { await this.loadProduct(productId); await this.loadAddresses() },
    async loadProduct(productId) { try { await ensureMemberSession(); this.product = (await appRequest({ url: '/app/products', data: { productId } }))[0] || null } catch (error) { showRequestError(error) } },
    async loadAddresses() { try { const list = await appRequest({ url: '/app/addresses' }); this.address = list.find(item => item.isDefault) || list[0] || null } catch (error) {} },
    chooseAddress() { uni.navigateTo({ url: '/pages/order/address' }) },
    async create() { if (!this.product) return; if (this.deliveryType === 'DELIVERY' && !this.address) { uni.showToast({ title: '配送订单请选择地址', icon: 'none' }); return }; this.creating = true; try { const order = await appRequest({ url: '/app/orders', method: 'POST', data: { productId: this.product.productId, quantity: this.quantity, addressId: this.address && this.address.addressId, deliveryType: this.deliveryType } }); uni.navigateTo({ url: `/pages/order/detail?orderNo=${order.orderNo}` }) } catch (error) { showRequestError(error) } finally { this.creating = false } }
  }
}
</script>
<style scoped>.page{min-height:100vh;background:var(--xy-bg)}.wrap{padding:24rpx}.card{display:flex;justify-content:space-between;gap:20rpx;margin-bottom:20rpx;padding:28rpx;border-radius:22rpx;background:#fff}.product-card{align-items:center}.right{display:flex;flex-direction:column;align-items:flex-end}.price,.total text{color:var(--xy-danger);font-weight:700}.origin{color:var(--xy-muted);font-size:22rpx;text-decoration:line-through}.discount,.discount-row{color:#e66b2f;font-size:22rpx}.muted{flex:1;text-align:right;color:var(--xy-ink-3);font-size:24rpx}.product-card .muted{display:block;margin-top:10rpx;text-align:left}.total{margin:40rpx 0;text-align:right}.discount-row{margin-bottom:12rpx}.submit{background:var(--xy-primary);color:#fff}</style>
