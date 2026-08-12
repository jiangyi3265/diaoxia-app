<template>
  <view class="page">
    <xy-header title="预约详情" />
    <view v-if="loading" class="wrap"><xy-state type="loading" /></view>
    <view v-else-if="item" class="wrap">
      <view class="status-panel" :class="statusClass">
        <view class="status-icon"><xy-icon :name="statusIcon" :size="44" color="#F4FBF9" /></view>
        <view><text>{{ labels[item.status] || item.status }}</text><text>{{ statusNote }}</text></view>
      </view>

      <view class="verify-card">
        <text class="verify-label">到店签到码</text>
        <text class="verify-code">{{ item.verifyCode || '------' }}</text>
        <text class="verify-note">到店后向工作人员出示此码完成签到</text>
      </view>

      <view class="info-card">
        <view><view class="row-icon"><xy-icon name="calendar" :size="32" color="#0B756E" /></view><view><text>预约时间</text><text>{{ item.reservationDate }} {{ item.startTime }}–{{ item.endTime }}</text></view></view>
        <view><view class="row-icon"><xy-icon name="seat" :size="32" color="#0B756E" /></view><view><text>门店与座位</text><text>{{ item.storeName }} · {{ item.zoneName }}{{ item.seatCode }}</text></view></view>
        <view><view class="row-icon"><xy-icon name="location" :size="32" color="#0B756E" /></view><view><text>门店地址</text><text>{{ item.address || '地址待门店更新' }}</text></view></view>
        <view v-if="item.phone"><view class="row-icon"><xy-icon name="phone" :size="32" color="#0B756E" /></view><view><text>联系电话</text><text>{{ item.phone }}</text></view></view>
      </view>

      <view class="order-no"><text>预约编号</text><text>{{ item.reservationNo }}</text></view>
      <view class="actions">
        <button v-if="item.phone" class="secondary" @click="call">联系门店</button>
        <button v-if="item.status === 'BOOKED'" class="danger" :disabled="canceling" @click="confirmCancel">{{ canceling ? '正在取消' : '取消预约' }}</button>
      </view>
    </view>
    <xy-state v-else type="error" title="预约详情不可用" description="这条预约可能已删除，或网络暂时不可用。" action-text="重新加载" @action="load" />
    <view class="xy-safe-bottom" />
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      reservationNo: '', item: null, loading: true, canceling: false,
      labels: { BOOKED: '待到场', CHECKED_IN: '已签到', CANCELED: '已取消', NO_SHOW: '已过期' }
    }
  },
  computed: {
    statusClass() { return this.item.status === 'BOOKED' ? 'booked' : this.item.status === 'CHECKED_IN' ? 'checked' : 'muted' },
    statusIcon() { return this.item.status === 'BOOKED' ? 'clock' : this.item.status === 'CHECKED_IN' ? 'check' : 'info' },
    statusNote() {
      return { BOOKED: '请按预约时段到店，提前准备好签到码', CHECKED_IN: '签到已完成，请前往对应座位', CANCELED: '预约已取消，不再占用座位', NO_SHOW: '预约时段已结束' }[this.item.status] || '预约状态已更新'
    }
  },
  onLoad(query) { this.reservationNo = String(query.reservationNo || ''); this.load() },
  methods: {
    async load() {
      if (!this.reservationNo) { this.loading = false; return }
      this.loading = true
      try { await ensureMemberSession(); this.item = await appRequest({ url: `/app/reservations/${this.reservationNo}` }) }
      catch (error) { this.item = null; showRequestError(error) }
      finally { this.loading = false }
    },
    call() { if (this.item.phone) uni.makePhoneCall({ phoneNumber: this.item.phone }) },
    confirmCancel() {
      uni.showModal({ title: '取消预约', content: '取消后座位会立即释放，确定继续吗？', confirmText: '取消预约', confirmColor: '#C65349', success: ({ confirm }) => { if (confirm) this.cancel() } })
    },
    async cancel() {
      if (this.canceling) return
      this.canceling = true
      try { await appRequest({ url: `/app/reservations/${this.reservationNo}/cancel`, method: 'POST' }); uni.showToast({ title: '预约已取消', icon: 'success' }); await this.load() }
      catch (error) { showRequestError(error) }
      finally { this.canceling = false }
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:20rpx 28rpx 34rpx}.status-panel{display:flex;align-items:center;gap:20rpx;padding:31rpx 28rpx;border-radius:30rpx;background:#0b8d84;color:#f4fbf9}.status-panel.checked{background:#32778c}.status-panel.muted{background:#788985}.status-icon{display:flex;width:78rpx;height:78rpx;align-items:center;justify-content:center;border-radius:24rpx;background:rgba(255,255,255,.14)}.status-panel>view:last-child{display:flex;flex:1;flex-direction:column;gap:8rpx}.status-panel text:first-child{font-size:32rpx;font-weight:800}.status-panel text:last-child{font-size:21rpx;line-height:1.45;opacity:.82}.verify-card{display:flex;flex-direction:column;align-items:center;margin-top:20rpx;padding:34rpx;border:1rpx solid #d9e8e4;border-radius:30rpx;background:#f9fcfb;text-align:center}.verify-label{color:#728681;font-size:21rpx}.verify-code{margin-top:12rpx;color:#163d37;font-family:"DIN Alternate","SF Pro Display",monospace;font-size:52rpx;font-weight:800;letter-spacing:10rpx}.verify-note{margin-top:10rpx;color:#788b86;font-size:21rpx}.info-card{margin-top:20rpx;padding:8rpx 25rpx;border-radius:28rpx;background:#f9fcfb}.info-card>view{display:flex;align-items:center;gap:17rpx;padding:21rpx 0;border-bottom:1rpx solid #e2ece9}.info-card>view:last-child{border-bottom:0}.row-icon{display:flex;width:60rpx;height:60rpx;align-items:center;justify-content:center;border-radius:19rpx;background:#e1f1ed}.info-card>view>view:last-child{display:flex;flex:1;flex-direction:column;gap:6rpx}.info-card text:first-child{color:#7a8d88;font-size:20rpx}.info-card text:last-child{color:#203b35;font-size:24rpx;line-height:1.45}.order-no{display:flex;justify-content:space-between;gap:20rpx;padding:22rpx 5rpx;color:#82928e;font-size:20rpx}.order-no text:last-child{overflow:hidden;color:#536b66;text-overflow:ellipsis}.actions{display:flex;gap:16rpx;margin-top:8rpx}.actions button{flex:1;height:84rpx;margin:0;border-radius:23rpx;font-size:25rpx;font-weight:700;line-height:84rpx}.secondary{border:1rpx solid #d3e1dd;background:#f9fcfb;color:#486760}.danger{background:#f5e7e4;color:#a64f47}.danger[disabled]{opacity:.6}
</style>
