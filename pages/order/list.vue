<template>
  <view class="page">
    <xy-header title="我的订单" />
    <view class="wrap">
      <view v-for="order in orders" :key="order.orderNo" class="order" @click="detail(order)">
        <view class="order-head"><text class="order-no">{{ order.orderNo }}</text><text class="status">{{ statusLabel(order) }}</text></view>
        <view class="goods">
          <image v-if="order.coverUrl" :src="order.coverUrl" mode="aspectFill" />
          <view v-else class="cover-placeholder"><xy-icon name="bag" :size="42" color="#0B756E" :weight="1.6" /></view>
          <view class="goods-copy"><text>{{ order.productName || '商城订单' }}</text><text>共 {{ order.quantity || 0 }} 件</text></view>
        </view>
        <view class="order-foot"><text>{{ deliveryLabel(order.deliveryType) }}</text><view><text>应付</text><text class="amount">¥{{ order.payableAmount }}</text><xy-icon name="chevron-right" :size="28" color="#91A39F" :weight="1.7" /></view></view>
        <view v-if="canRefund(order)" class="quick-actions">
          <button @click.stop="refund(order)">申请退款</button>
        </view>
      </view>
      <view v-if="!orders.length" class="empty"><view><xy-icon name="invoice" :size="60" color="#0B756E" :weight="1.5" /></view><text class="empty-title">还没有订单</text><text class="empty-note">商城里的钓具和到店好物，都会记录在这里。</text><button @click="mall">逛逛商城</button></view>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      orders: [],
      labels: { PENDING_PAYMENT:'待支付', PAID:'待发货', SHIPPED:'待收货', COMPLETED:'已完成', CANCELED:'已取消', AFTER_SALE:'退款处理中', REFUNDED:'已退款' },
      refundLabels: { PENDING:'退款审核中', REFUNDING:'退款处理中', APPROVED:'已退款', REJECTED:'退款未通过', REFUND_FAILED:'退款失败' }
    }
  },
  onShow() { this.load() },
  methods: {
    async load() { try { await ensureMemberSession(); this.orders = await appRequest({ url:'/app/orders' }) } catch (error) { showRequestError(error) } },
    statusLabel(order) { return this.refundLabels[order.afterSaleStatus] || this.labels[order.status] || order.status },
    canRefund(order) { return ['PAID','SHIPPED','COMPLETED'].includes(order.status) && !['PENDING','REFUNDING','APPROVED','REFUND_FAILED'].includes(order.afterSaleStatus) },
    deliveryLabel(type) { return type === 'DELIVERY' ? '配送到家' : '到店自提' },
    detail(order) { uni.navigateTo({ url:`/pages/order/detail?orderNo=${order.orderNo}` }) },
    refund(order) { uni.navigateTo({ url:`/pages/order/aftersale?orderNo=${order.orderNo}` }) },
    mall() { uni.reLaunch({ url:'/pages/mall/mall' }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:26rpx}.order{margin-bottom:18rpx;padding:24rpx;border:1rpx solid #dbe8e4;border-radius:28rpx;background:#f8fcfa}.order-head,.order-foot{display:flex;align-items:center;justify-content:space-between}.order-head{padding-bottom:18rpx;border-bottom:1rpx solid #e1ebe8}.order-no{max-width:480rpx;overflow:hidden;color:#758984;font-size:20rpx;text-overflow:ellipsis}.status{color:#0b756e;font-size:22rpx;font-weight:700}.goods{display:flex;align-items:center;gap:18rpx;padding:22rpx 0}.goods image,.cover-placeholder{width:104rpx;height:104rpx;border-radius:20rpx;background:#dcefe9}.cover-placeholder{display:flex;align-items:center;justify-content:center}.goods-copy{display:flex;flex:1;flex-direction:column;gap:9rpx}.goods-copy text:first-child{font-size:27rpx;font-weight:700}.goods-copy text:last-child{color:#7b8e89;font-size:21rpx}.order-foot{padding-top:18rpx;border-top:1rpx solid #e1ebe8;color:#7a8d88;font-size:21rpx}.order-foot view{display:flex;align-items:center;gap:7rpx}.amount{color:#243d38;font-size:27rpx;font-weight:750}.quick-actions{display:flex;justify-content:flex-end;margin-top:18rpx}.quick-actions button{height:66rpx;margin:0;padding:0 24rpx;border:1rpx solid #d6e2df;border-radius:20rpx;background:#f8fcfa;color:#45645e;font-size:22rpx;font-weight:700;line-height:66rpx}.quick-actions button::after{border:0}.empty{display:flex;flex-direction:column;align-items:center;padding:118rpx 50rpx;text-align:center}.empty>view{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:34rpx;background:#dcefe9}.empty-title{margin-top:25rpx;font-size:30rpx;font-weight:750}.empty-note{margin-top:12rpx;color:#748984;font-size:22rpx;line-height:1.6}.empty button{height:82rpx;margin-top:28rpx;padding:0 36rpx;border-radius:24rpx;background:#0b756e;color:#f3fcf9;font-size:25rpx;font-weight:700}
</style>
