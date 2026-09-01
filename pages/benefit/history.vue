<template>
  <view class="page">
    <xy-header title="我的福利钓" />
    <view class="wrap">
      <xy-state v-if="loading" type="loading" />
      <xy-state v-else-if="error" type="error" title="报名记录加载失败" :description="error" action-text="重新加载" @action="load" />
      <view v-else-if="records.length" class="records">
        <view v-for="item in records" :key="item.bookingNo" class="record">
          <view class="record-top"><view><text>{{ formatDate(item.eventDate) }}</text><text>{{ item.startTime }}–{{ item.endTime }}</text></view><text class="status" :class="statusClass(item.displayStatus)">{{ item.displayStatus }}</text></view>
          <view class="record-main"><view class="seat"><text>{{ item.seatNo }}</text><text>座位</text></view><view class="info"><text>{{ item.storeName }}</text><text>{{ item.address }}</text><text>报名费 ¥{{ money(item.feeAmount) }} · 编号 {{ item.bookingNo }}</text></view></view>
          <view v-if="item.displayStatus === '已报名'" class="arrival"><xy-icon name="clock" :size="29" color="#0B756E" /><text>请留意专场通知，并于20:15前到店。</text></view>
          <view v-else-if="item.displayStatus === '专场已取消'" class="arrival muted"><xy-icon name="info" :size="29" color="#7C8E89" /><text>本场福利钓专场已取消，详情请联系商家。</text></view>
          <view v-if="showPaymentAction(item)" class="payment-action" :class="{ expired: paymentExpired(item) }">
            <view>
              <text>{{ paymentExpired(item) ? '锁座时间已结束' : canContinuePayment(item) ? '座位正在为你保留' : '支付状态正在确认' }}</text>
              <text>{{ paymentExpired(item) ? '正在确认座位释放状态，刷新后可重新选择。' : canContinuePayment(item) ? `剩余 ${countdownText(item.paymentRemainingSeconds)}，完成支付后报名成功。` : '请稍后刷新报名状态。' }}</text>
            </view>
            <button v-if="canContinuePayment(item)" :disabled="!!payingBookingNo" :loading="payingBookingNo === item.bookingNo" @click="continuePayment(item)">继续支付</button>
            <button v-else-if="paymentExpired(item)" :disabled="!!payingBookingNo" :loading="payingBookingNo === item.bookingNo" @click="refreshExpiredPayment(item)">刷新状态</button>
            <button v-else disabled>状态确认中</button>
          </view>
        </view>
      </view>
      <view v-else class="empty"><view><xy-icon name="medal" :size="58" color="#8CA09B" /></view><text>还没有福利钓报名</text><text>开放场次中可以查看公告并选择一个位置。</text><button @click="goBenefit">查看福利钓专场</button></view>
    </view>
    <view class="xy-safe-bottom" />
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default {
  data() { return { records: [], loading: true, error: '', payingBookingNo: '', paymentTimer: null, bookingPollTimer: null, pageVisible: true } },
  onShow() { this.pageVisible = true; this.load() },
  onHide() { this.pageVisible = false; this.stopPaymentCountdown(); this.stopBookingPoll() },
  onUnload() { this.pageVisible = false; this.stopPaymentCountdown(); this.stopBookingPoll() },
  methods: {
    async load(silent = false) {
      if (!silent) { this.loading = true; this.error = '' }
      try {
        await ensureMemberSession()
        this.records = await appRequest({ url: '/app/benefit-bookings' })
        this.startPaymentCountdown()
      } catch (error) {
        if (!silent) this.error = (error && error.message) || '暂时无法读取报名记录'
        else throw error
      } finally { if (!silent) this.loading = false }
    },
    isPending(item) { return item?.displayStatus === '报名确认中' },
    canContinuePayment(item) { return !!(this.isPending(item) && item?.canContinuePayment && Number(item.paymentRemainingSeconds || 0) > 0) },
    paymentExpired(item) { return this.isPending(item) && Number(item.paymentRemainingSeconds || 0) <= 0 },
    showPaymentAction(item) { return this.isPending(item) },
    async continuePayment(item) {
      if (this.payingBookingNo || !this.canContinuePayment(item)) return
      this.payingBookingNo = item.bookingNo
      try {
        await ensureMemberSession()
        const payment = await appRequest({ url: `/app/benefit-bookings/${encodeURIComponent(item.bookingNo)}/payment`, method: 'POST' })
        if (payment.paid) { await this.finishPaidBooking(item.bookingNo); return }
        this.requestPayment(payment, item.bookingNo)
      } catch (error) {
        this.payingBookingNo = ''
        showRequestError(error)
        await this.load(true).catch(() => {})
      }
    },
    requestPayment(payment, bookingNo) {
      uni.requestPayment({ ...payment,
        success: () => { uni.showToast({ title: '付款完成，正在确认报名', icon: 'none' }); this.waitForBooking(bookingNo, 0) },
        fail: () => {
          this.payingBookingNo = ''
          uni.showToast({ title: '支付未完成，可在保留时间内继续支付', icon: 'none' })
          this.load(true).catch(() => {})
        }
      })
    },
    async finishPaidBooking(bookingNo) {
      this.stopBookingPoll()
      try {
        await this.load(true)
        const current = this.records.find(item => item.bookingNo === bookingNo)
        const booked = current?.displayStatus === '已报名'
        uni.showToast({ title: booked ? '报名成功' : '状态已同步', icon: booked ? 'success' : 'none' })
      } finally { this.payingBookingNo = '' }
    },
    async waitForBooking(bookingNo, attempt) {
      if (!this.pageVisible) { this.payingBookingNo = ''; this.stopBookingPoll(); return }
      try {
        await this.load(true)
        const current = this.records.find(item => item.bookingNo === bookingNo)
        if (current?.displayStatus === '已报名') { this.stopBookingPoll(); this.payingBookingNo = ''; uni.showToast({ title: '报名成功', icon: 'success' }); return }
      } catch (error) {}
      if (attempt >= 5) {
        this.stopBookingPoll()
        this.payingBookingNo = ''
        uni.showModal({ title: '报名正在确认', content: '微信支付结果正在同步，请稍后再查看报名状态。', showCancel: false, confirmColor: '#0B756E' })
        return
      }
      this.stopBookingPoll()
      this.bookingPollTimer = setTimeout(() => this.waitForBooking(bookingNo, attempt + 1), 1000)
    },
    startPaymentCountdown() {
      this.stopPaymentCountdown()
      if (!this.records.some(item => this.isPending(item) && Number(item.paymentRemainingSeconds || 0) > 0)) return
      this.paymentTimer = setInterval(() => {
        let reachedZero = false
        this.records.forEach(item => {
          if (!this.isPending(item)) return
          const previous = Number(item.paymentRemainingSeconds || 0)
          const next = Math.max(0, Number(item.paymentRemainingSeconds || 0) - 1)
          item.paymentRemainingSeconds = next
          if (previous > 0 && next === 0) reachedZero = true
        })
        if (!this.records.some(item => this.isPending(item) && Number(item.paymentRemainingSeconds || 0) > 0)) this.stopPaymentCountdown()
        if (reachedZero) this.load(true).catch(() => {})
      }, 1000)
    },
    stopPaymentCountdown() { if (this.paymentTimer) clearInterval(this.paymentTimer); this.paymentTimer = null },
    stopBookingPoll() { if (this.bookingPollTimer) clearTimeout(this.bookingPollTimer); this.bookingPollTimer = null },
    async refreshExpiredPayment(item) {
      if (this.payingBookingNo) return
      this.payingBookingNo = item.bookingNo
      try {
        await this.load(true)
        const current = this.records.find(record => record.bookingNo === item.bookingNo)
        if (!current || !this.isPending(current)) { this.goBenefit(current || item); return }
        uni.showToast({ title: '座位状态正在同步，请稍后再试', icon: 'none' })
      } catch (error) { showRequestError(error) }
      finally { this.payingBookingNo = '' }
    },
    countdownText(value) {
      const seconds = Math.max(0, Number(value || 0))
      return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
    },
    formatDate(value) { const [y,m,d] = String(value).split('-'); return `${y}年${Number(m)}月${Number(d)}日` },
    money(value) { return Number(value || 0).toFixed(2) },
    statusClass(value) { return value === '已报名' ? 'active' : value === '报名确认中' ? 'pending' : 'muted' },
    goBenefit(item) {
      const eventId = Number(item?.eventId || 0)
      uni.redirectTo({ url: eventId > 0 ? `/pages/benefit/benefit?eventId=${eventId}` : '/pages/benefit/benefit' })
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3;color:#18322e}.wrap{padding:24rpx}.records{display:flex;flex-direction:column;gap:18rpx}.record{padding:25rpx;border:1rpx solid #dbe8e4;border-radius:29rpx;background:#f8fcfa}.record-top{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20rpx;border-bottom:1rpx solid #e1ebe8}.record-top>view{display:flex;flex-direction:column;gap:7rpx}.record-top>view text:first-child{font-size:28rpx;font-weight:780}.record-top>view text:last-child{color:#5e746f;font-size:22rpx}.status{padding:8rpx 14rpx;border-radius:16rpx;font-size:20rpx;font-weight:700}.status.active{background:#dcefe9;color:#0b756e}.status.pending{background:#f2e7d2;color:#845d29}.status.muted{background:#e5ebe9;color:#758782}.record-main{display:flex;align-items:center;gap:20rpx;padding-top:21rpx}.seat{display:flex;width:82rpx;height:82rpx;align-items:center;justify-content:center;flex-direction:column;border-radius:25rpx;background:#dcefe9;color:#0b756e}.seat text:first-child{font-size:31rpx;font-weight:820}.seat text:last-child{font-size:17rpx}.info{display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx}.info text:first-child{font-size:25rpx;font-weight:750}.info text:nth-child(2){color:#6c817c;font-size:20rpx}.info text:last-child{overflow:hidden;color:#8b9a96;font-size:17rpx;text-overflow:ellipsis;white-space:nowrap}.arrival{display:flex;align-items:center;gap:10rpx;margin-top:18rpx;padding:15rpx 17rpx;border-radius:19rpx;background:#e6f3ef;color:#3e665e;font-size:20rpx}.arrival.muted{background:#ebefee;color:#71817d}.empty{display:flex;align-items:center;flex-direction:column;padding:110rpx 30rpx;text-align:center}.empty>view{display:flex;width:110rpx;height:110rpx;align-items:center;justify-content:center;border-radius:34rpx;background:#dfece8}.empty>text:nth-child(2){margin-top:24rpx;font-size:30rpx;font-weight:780}.empty>text:nth-child(3){margin-top:11rpx;color:#748984;font-size:21rpx}.empty button{height:80rpx;margin-top:28rpx;padding:0 32rpx;border-radius:23rpx;background:#0b756e;color:#f4fbf9;font-size:24rpx;font-weight:720;line-height:80rpx}
</style>

<style scoped>
.payment-action{display:flex;align-items:center;gap:18rpx;margin-top:18rpx;padding:18rpx;border-radius:22rpx;background:#f7edda;color:#6d4b24}
.payment-action>view{display:flex;min-width:0;flex:1;flex-direction:column;gap:6rpx}
.payment-action>view text:first-child{font-size:23rpx;font-weight:760}
.payment-action>view text:last-child{color:#806b50;font-size:19rpx;line-height:1.45}
.payment-action button{flex:none;width:210rpx;height:88rpx;margin:0;padding:0;border-radius:23rpx;background:#8a5a27;color:#fff8ed;font-size:22rpx;font-weight:740;line-height:88rpx}
.payment-action button[disabled]{background:#cbbda7;color:#f5efe5;opacity:1}
.payment-action.expired{background:#e8efed;color:#526762}
.payment-action.expired>view text:last-child{color:#71827e}
.payment-action.expired button{background:#0b756e;color:#f4fbf9}
</style>
