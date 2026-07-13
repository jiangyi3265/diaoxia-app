<template>
  <view class="page">
    <xy-header title="订单详情" />
    <view v-if="order" class="content">
      <view class="status-panel" :class="statusTone">
        <view class="status-icon"><xy-icon :name="statusIcon" :size="46" color="#f3fbf8" /></view>
        <view><text>{{ labels[order.status] || order.status }}</text><text>{{ statusNote }}</text></view>
      </view>

      <view v-if="demoEnabled && order.status === 'PENDING_PAYMENT'" class="demo-tip">
        <xy-icon name="info" :size="28" color="#0a8f84" />
        <text>演示支付已开启，不会产生真实扣款</text>
      </view>

      <view class="goods-section">
        <view v-for="item in order.items" :key="item.productId" class="goods-row">
          <image v-if="item.coverUrl" :src="item.coverUrl" mode="aspectFill" />
          <view><text>{{ item.productName }}</text><text>¥{{ item.salePrice }} × {{ item.quantity }}</text></view>
          <text>¥{{ item.subtotalAmount }}</text>
        </view>
      </view>

      <view class="info-section">
        <view><text>配送方式</text><text>{{ order.deliveryType === 'PICKUP' ? '到店自提' : '配送到家' }}</text></view>
        <view v-if="order.receiverSnapshot"><text>收货信息</text><text class="multiline">{{ order.receiverSnapshot }}</text></view>
        <view><text>订单编号</text><text class="copyable">{{ order.orderNo }}</text></view>
        <view><text>下单时间</text><text>{{ order.createTime || '--' }}</text></view>
      </view>

      <view class="amount-section">
        <view><text>商品金额</text><text>¥{{ order.totalAmount }}</text></view>
        <view v-if="Number(order.discountAmount) > 0" class="discount"><text>会员优惠</text><text>-¥{{ order.discountAmount }}</text></view>
        <view><text>配送费</text><text>¥{{ order.freightAmount }}</text></view>
        <view class="total"><text>实付金额</text><text>¥{{ order.status === 'PENDING_PAYMENT' ? order.payableAmount : order.paidAmount }}</text></view>
      </view>
      <view class="bottom-space" />
    </view>

    <view v-else class="empty-state"><xy-icon name="invoice" :size="58" color="#0b756e" /><text>订单不存在</text></view>

    <view v-if="order && availableActions" class="action-bar">
      <button v-if="order.status === 'PENDING_PAYMENT'" class="secondary" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 'PENDING_PAYMENT'" class="primary" :loading="paying" @click="pay">{{ demoEnabled ? '演示支付' : '微信支付' }} ¥{{ order.payableAmount }}</button>
      <button v-if="order.status === 'SHIPPED'" class="primary" @click="receipt">确认收货</button>
      <button v-if="['PAID','SHIPPED','COMPLETED'].includes(order.status)" class="secondary" @click="aftersale">申请售后</button>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, publicRequest, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      order: null, orderNo: '', demoEnabled: false, paying: false,
      labels: { PENDING_PAYMENT: '等待支付', PAID: '等待发货', SHIPPED: '商品已发出', COMPLETED: '订单已完成', CANCELED: '订单已取消', AFTER_SALE: '售后处理中', REFUNDED: '订单已退款' }
    }
  },
  computed: {
    statusTone() { return ['CANCELED','REFUNDED'].includes(this.order.status) ? 'muted' : this.order.status === 'PENDING_PAYMENT' ? 'waiting' : 'success' },
    statusIcon() { return this.order.status === 'PENDING_PAYMENT' ? 'wallet' : ['CANCELED','REFUNDED'].includes(this.order.status) ? 'close' : 'check' },
    statusNote() {
      const notes = { PENDING_PAYMENT: '完成支付后，商家将开始处理订单', PAID: '商家正在准备商品，请耐心等待', SHIPPED: '请留意配送信息或到店领取', COMPLETED: '感谢你的购买，期待再次光临', CANCELED: '订单已关闭，库存已经恢复', AFTER_SALE: '商家正在处理你的售后申请', REFUNDED: '款项已按原流程退回' }
      return notes[this.order.status] || '订单状态已更新'
    },
    availableActions() { return ['PENDING_PAYMENT','SHIPPED','PAID','COMPLETED'].includes(this.order.status) }
  },
  onLoad(query) { this.orderNo = query.orderNo; this.initialize() },
  methods: {
    async initialize() { await Promise.all([this.load(), this.loadPaymentMode()]) },
    async loadPaymentMode() { try { const settings = await publicRequest({ url: '/app/payment-settings' }); this.demoEnabled = !!settings.demoEnabled } catch (error) {} },
    async load() { try { await ensureMemberSession(); this.order = await appRequest({ url: `/app/orders/${this.orderNo}` }) } catch (error) { showRequestError(error) } },
    async pay() {
      if (this.paying) return
      this.paying = true
      try {
        const payment = await appRequest({ url: `/app/orders/${this.orderNo}/payment`, method: 'POST' })
        if (payment.demoPayment) {
          uni.showToast({ title: '演示支付成功', icon: 'success' })
          await this.load()
          return
        }
        uni.requestPayment({ ...payment, success: () => this.load(), fail: () => uni.showToast({ title: '支付未完成', icon: 'none' }) })
      } catch (error) { showRequestError(error) } finally { this.paying = false }
    },
    cancelOrder() { uni.showModal({ title: '取消订单', content: '确定取消这个订单吗？', confirmColor: '#d45b55', success: async ({ confirm }) => { if (!confirm) return; try { await appRequest({ url: `/app/orders/${this.orderNo}/cancel`, method: 'POST' }); await this.load() } catch (error) { showRequestError(error) } } }) },
    async receipt() { try { await appRequest({ url: `/app/orders/${this.orderNo}/receipt`, method: 'POST' }); await this.load() } catch (error) { showRequestError(error) } },
    aftersale() { uni.navigateTo({ url: `/pages/order/aftersale?orderNo=${this.orderNo}` }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef5f3}.content{padding:18rpx 26rpx}.status-panel{display:flex;align-items:center;gap:20rpx;padding:34rpx 30rpx;border-radius:30rpx;background:#0c8f85;color:#f4fbf9}.status-panel.waiting{background:#bd7648}.status-panel.muted{background:#6d7e7a}.status-icon{display:flex;align-items:center;justify-content:center;width:82rpx;height:82rpx;border-radius:26rpx;background:rgba(244,251,249,.14)}.status-panel>view:last-child{display:flex;flex:1;flex-direction:column;gap:8rpx}.status-panel text:first-child{font-size:32rpx;font-weight:850}.status-panel text:last-child{font-size:21rpx;opacity:.8}.demo-tip{display:flex;align-items:center;gap:12rpx;margin-top:18rpx;padding:19rpx 22rpx;border-radius:20rpx;background:#dcf1ed;color:#51716b;font-size:22rpx}.goods-section,.info-section,.amount-section{margin-top:20rpx;padding:10rpx 24rpx;border-radius:28rpx;background:#f9fcfb}.goods-row{display:flex;align-items:center;gap:18rpx;padding:18rpx 0}.goods-row image{width:112rpx;height:112rpx;border-radius:19rpx;background:#dce8e5}.goods-row>view{display:flex;flex:1;min-width:0;flex-direction:column;gap:10rpx}.goods-row>view text:first-child{font-size:27rpx;font-weight:750}.goods-row>view text:last-child{color:#81908d;font-size:22rpx}.goods-row>text{color:#263633;font-size:26rpx;font-weight:750}.info-section,.amount-section{padding:14rpx 26rpx}.info-section>view,.amount-section>view{display:flex;justify-content:space-between;gap:30rpx;padding:16rpx 0;color:#687a76;font-size:23rpx}.info-section>view>text:last-child,.amount-section>view>text:last-child{color:#273633;text-align:right}.info-section .multiline{max-width:430rpx;line-height:1.55}.copyable{font-size:21rpx}.amount-section .discount>text:last-child{color:#d9613d}.amount-section .total{margin-top:7rpx;padding-top:23rpx;border-top:1rpx solid #e0e9e7;color:#253532;font-weight:750}.amount-section .total>text:last-child{color:#df594c;font-size:32rpx;font-weight:900}.bottom-space{height:145rpx}.empty-state{display:flex;flex-direction:column;align-items:center;gap:22rpx;padding:160rpx 30rpx;color:#778985}.action-bar{position:fixed;z-index:10;right:0;bottom:0;left:0;display:flex;justify-content:flex-end;gap:16rpx;padding:18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom));background:#f8fbfa;box-shadow:0 -10rpx 30rpx rgba(23,73,68,.08)}.action-bar button{height:84rpx;margin:0;padding:0 30rpx;border-radius:23rpx;font-size:25rpx;font-weight:750;line-height:84rpx}.primary{min-width:300rpx;background:#0b8d84;color:#f4fbf9}.secondary{border:1rpx solid #d5e1de;background:#f8fbfa;color:#596d68}
</style>
