<template>
  <view class="page">
    <xy-header title="我的订单" />
    <view class="wrap">
      <view class="filters"><text :class="{ active: view === 'all' }" @click="view = 'all'">全部订单</text><text :class="{ active: view === 'refund' }" @click="view = 'refund'">退款 / 售后</text></view>
      <view v-if="loading" class="loading"><view v-for="i in 3" :key="i" class="xy-skeleton" /></view>
      <xy-state v-else-if="error" type="error" title="订单加载失败" :description="error" action-text="重新加载" @action="load" />
      <view v-for="order in displayOrders" v-if="!loading && !error" :key="order.orderNo" class="order" @click="detail(order)">
        <view class="order-head"><text class="order-no">{{ order.orderNo }}</text><text class="status">{{ statusLabel(order) }}</text></view>
        <view class="goods">
          <image v-if="order.coverUrl" :src="mediaUrl(order.coverUrl)" mode="aspectFill" @error="order.coverUrl = ''" />
          <view v-else class="cover-placeholder"><xy-icon name="bag" :size="42" color="#0B756E" :weight="1.6" /></view>
          <view class="goods-copy"><text>{{ order.productName || '商城订单' }}</text><text>共 {{ order.quantity || 0 }} 件</text></view>
        </view>
        <view class="order-foot"><text>{{ deliveryLabel(order.deliveryType) }}</text><view><text>应付</text><text class="amount">¥{{ order.payableAmount }}</text><xy-icon name="chevron-right" :size="28" color="#91A39F" :weight="1.7" /></view></view>
        <view v-if="canRefund(order)" class="quick-actions">
          <button @click.stop="refund(order)">申请退款</button>
        </view>
      </view>
      <view v-if="!loading && !error && !displayOrders.length" class="empty"><view><xy-icon :name="view === 'refund' ? 'refresh' : 'invoice'" :size="60" color="#0B756E" :weight="1.5" /></view><text class="empty-title">{{ view === 'refund' ? '暂无售后记录' : '还没有订单' }}</text><text class="empty-note">{{ view === 'refund' ? '提交退款申请后，可在这里查看处理进度。' : '商城里的钓具和到店好物，都会记录在这里。' }}</text><button v-if="view !== 'refund'" @click="mall">逛逛商城</button></view>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, resolveMediaUrl, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      orders: [], view: 'all', loading: true, error: '',
      labels: { PENDING_PAYMENT:'待付款', PAID:'待发货', SHIPPED:'待收货', COMPLETED:'已完成', CANCELED:'已取消', AFTER_SALE:'退款处理中', REFUNDED:'已退款' },
      refundLabels: { PENDING:'退款审核中', REFUNDING:'退款处理中', APPROVED:'已退款', REJECTED:'退款未通过', REFUND_FAILED:'退款失败' }
    }
  },
  computed: { displayOrders() { return this.view === 'refund' ? this.orders.filter(order => !!order.afterSaleStatus || ['AFTER_SALE','REFUNDED'].includes(order.status)) : this.orders } },
  onLoad(query) { this.view = query.view === 'refund' ? 'refund' : 'all' },
  onShow() { this.load() },
  methods: {
    async load() { this.loading = true; this.error = ''; try { await ensureMemberSession(); this.orders = await appRequest({ url:'/app/orders' }) } catch (error) { this.error = (error && error.message) || '网络连接失败' } finally { this.loading = false } },
    statusLabel(order) {
      const offline = String(order.paymentChannel || order.channel || '').toUpperCase() === 'OFFLINE'
      if (!order.afterSaleStatus && order.status === 'PENDING_PAYMENT' && offline) {
        return String(order.paymentStatus || '').toUpperCase() === 'PENDING' ? '待门店确认' : '待到店付款'
      }
      return this.refundLabels[order.afterSaleStatus] || this.labels[order.status] || order.status
    },
    canRefund(order) { return ['PAID','SHIPPED','COMPLETED'].includes(order.status) && !['PENDING','REFUNDING','APPROVED','REFUND_FAILED'].includes(order.afterSaleStatus) },
    deliveryLabel(type) { return type === 'DELIVERY' ? '配送到家' : '到店自提' },
    mediaUrl(value) { return resolveMediaUrl(value) },
    detail(order) { uni.navigateTo({ url:`/pages/order/detail?orderNo=${order.orderNo}` }) },
    refund(order) { uni.navigateTo({ url:`/pages/order/aftersale?orderNo=${order.orderNo}` }) },
    mall() { uni.reLaunch({ url:'/pages/mall/mall' }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:26rpx}.order{margin-bottom:18rpx;padding:24rpx;border:1rpx solid #dbe8e4;border-radius:28rpx;background:#f8fcfa}.order-head,.order-foot{display:flex;align-items:center;justify-content:space-between}.order-head{padding-bottom:18rpx;border-bottom:1rpx solid #e1ebe8}.order-no{max-width:480rpx;overflow:hidden;color:#758984;font-size:20rpx;text-overflow:ellipsis}.status{color:#0b756e;font-size:22rpx;font-weight:700}.goods{display:flex;align-items:center;gap:18rpx;padding:22rpx 0}.goods image,.cover-placeholder{width:104rpx;height:104rpx;border-radius:20rpx;background:#dcefe9}.cover-placeholder{display:flex;align-items:center;justify-content:center}.goods-copy{display:flex;flex:1;flex-direction:column;gap:9rpx}.goods-copy text:first-child{font-size:27rpx;font-weight:700}.goods-copy text:last-child{color:#7b8e89;font-size:21rpx}.order-foot{padding-top:18rpx;border-top:1rpx solid #e1ebe8;color:#7a8d88;font-size:21rpx}.order-foot view{display:flex;align-items:center;gap:7rpx}.amount{color:#243d38;font-size:27rpx;font-weight:750}.quick-actions{display:flex;justify-content:flex-end;margin-top:18rpx}.quick-actions button{height:66rpx;margin:0;padding:0 24rpx;border:1rpx solid #d6e2df;border-radius:20rpx;background:#f8fcfa;color:#45645e;font-size:22rpx;font-weight:700;line-height:66rpx}.quick-actions button::after{border:0}.empty{display:flex;flex-direction:column;align-items:center;padding:118rpx 50rpx;text-align:center}.empty>view{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:34rpx;background:#dcefe9}.empty-title{margin-top:25rpx;font-size:30rpx;font-weight:750}.empty-note{margin-top:12rpx;color:#748984;font-size:22rpx;line-height:1.6}.empty button{height:82rpx;margin-top:28rpx;padding:0 36rpx;border-radius:24rpx;background:#0b756e;color:#f3fcf9;font-size:25rpx;font-weight:700}
.filters{display:flex;gap:8rpx;margin:0 0 20rpx;padding:6rpx;border-radius:22rpx;background:#e3ece9}.filters text{display:flex;flex:1;align-items:center;justify-content:center;height:68rpx;border-radius:18rpx;color:#687c77;font-size:23rpx}.filters text.active{background:#f9fcfb;color:#0b756e;font-weight:700;box-shadow:0 6rpx 16rpx rgba(20,77,71,.07)}.loading{display:flex;flex-direction:column;gap:18rpx}.loading view{height:300rpx;border-radius:28rpx}
</style>
