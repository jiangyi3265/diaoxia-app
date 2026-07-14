<template>
  <view class="page">
    <xy-header title="预约选座" variant="brand" :show-back="false" />
    <scroll-view class="date-strip" scroll-x>
      <view class="date-row">
        <view v-for="(date, index) in dates" :key="date.value" class="date-item" :class="{ on: selDate === index }" @click="pickDate(index)">
          <text>{{ date.week }}</text><text class="day">{{ date.day }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="wrap">
      <view class="notice">{{ availabilityRule || '每位会员同时只能保留1个待到场预约；到店签到后，自当前场次结束前10分钟起，可不限次续约当天更晚的空余时段。' }}</view>
      <view class="section"><text>选择时段</text></view>
      <view v-if="loading" class="empty">正在获取可约时段…</view>
      <view v-else-if="slots.length === 0" class="empty">该门店尚未配置可预约时段</view>
      <view v-else class="slot-grid">
        <view v-for="(slot, index) in slots" :key="slot.slotId" class="slot" :class="{ on: selSlot === index, full: !canBookSlot(slot) }" @click="pickSlot(index)">
          <text>{{ slot.time }}</text><text>{{ slot.booked >= slot.total ? '已约满' : (!slot.bookable ? '已开始' : `剩余 ${slot.total - slot.booked} 座`) }}</text>
        </view>
      </view>

      <view class="section"><text>选择座位</text><text class="muted">绿色可约，灰色已约</text></view>
      <view class="seat-grid">
        <view v-for="seat in seats" :key="seat.seatId" class="seat" :class="seatClass(seat)" @click="pickSeat(seat)">
          <text>{{ seat.zone }}{{ seat.no }}</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <view class="summary"><text v-if="curSeat && selectedSlot">{{ selectedDate.full }} {{ selectedSlot.time }} · {{ curSeat.zone }}{{ curSeat.no }}</text><text v-else>请选择时段和座位</text></view>
      <button class="submit" :disabled="!curSeat || submitting" @click="confirm">{{ submitting ? '提交中…' : '确认预约' }}</button>
    </view>
    <view class="xy-tabbar-hold"></view><xy-tabbar active="reserve" />
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, publicRequest, showRequestError } from '../../utils/api'

export default {
  data() {
    return { storeId: null, dates: [], selDate: 0, slots: [], selSlot: 0, seats: [], curSeat: null, loading: true, submitting: false, availabilityRule: '', notificationTemplateId: '' }
  },
  computed: {
    selectedDate() { return this.dates[this.selDate] || {} },
    selectedSlot() { return this.slots[this.selSlot] || null }
  },
  onLoad() {
    this.buildDates()
    this.initialize()
  },
  methods: {
    buildDates() {
      const weeks = ['日', '一', '二', '三', '四', '五', '六']
      const today = new Date()
      this.dates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
        const value = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
        return { value, full: value, week: index === 0 ? '今天' : `周${weeks[date.getDay()]}`, day: String(date.getDate()).padStart(2, '0') }
      })
    },
    async initialize() {
      try {
        const [stores, notificationSettings] = await Promise.all([
          publicRequest({ url: '/app/stores' }),
          publicRequest({ url: '/app/notification-settings' })
        ])
        if (!stores.length) throw new Error('门店尚未配置，请联系商家')
        this.storeId = stores[0].storeId
        this.notificationTemplateId = notificationSettings.reservationReminderTemplateId || ''
        await this.loadAvailability()
      } catch (error) { showRequestError(error) } finally { this.loading = false }
    },
    async loadAvailability() {
      if (!this.storeId || !this.selectedDate.value) return
      const data = await publicRequest({ url: `/app/stores/${this.storeId}/availability`, data: { date: this.selectedDate.value } })
      const selectedSlotId = this.selectedSlot && this.selectedSlot.slotId
      this.slots = data.slots.map((slot) => ({ slotId: slot.slotId, time: `${slot.startTime}-${slot.endTime}`, total: Number(slot.totalCount), booked: Number(slot.bookedCount), bookable: slot.bookable !== false }))
      this.availabilityRule = data.sameDayRolloverRule || this.availabilityRule
      let selectedIndex = this.slots.findIndex((slot) => slot.slotId === selectedSlotId)
      if (selectedIndex < 0 || !this.canBookSlot(this.slots[selectedIndex])) selectedIndex = this.slots.findIndex((slot) => this.canBookSlot(slot))
      this.selSlot = selectedIndex >= 0 ? selectedIndex : 0
      const slotId = this.selectedSlot && this.selectedSlot.slotId
      this.seats = data.seats.map((seat) => ({
        seatId: seat.seatId,
        zone: seat.zoneName || '',
        no: seat.seatCode,
        status: String(seat.bookedSlotIds || '').split(',').includes(String(slotId)) ? 'booked' : 'free'
      }))
      this.curSeat = null
    },
    pickDate(index) { this.selDate = index; this.loadAvailability().catch(showRequestError) },
    pickSlot(index) {
      if (!this.canBookSlot(this.slots[index])) { uni.showToast({ title: this.slots[index].booked >= this.slots[index].total ? '该时段已约满' : '该时段已开始，不能预约', icon: 'none' }); return }
      this.selSlot = index
      this.loadAvailability().catch(showRequestError)
    },
    canBookSlot(slot) { return !!slot && slot.bookable && slot.booked < slot.total },
    pickSeat(seat) {
      if (seat.status === 'booked') return
      this.curSeat = this.curSeat && this.curSeat.seatId === seat.seatId ? null : seat
    },
    seatClass(seat) { return seat.status === 'booked' ? 'booked' : this.curSeat && this.curSeat.seatId === seat.seatId ? 'selected' : 'free' },
    async confirm() {
      if (!this.curSeat || !this.selectedSlot || this.submitting) return
      this.submitting = true
      try {
        // 必须在点击事件中立即调用，否则微信不会展示订阅授权窗口。
        const subscription = this.requestReminderSubscription()
        await ensureMemberSession()
        const reservation = await appRequest({ url: '/app/reservations', method: 'POST', data: { storeId: this.storeId, slotId: this.selectedSlot.slotId, seatId: this.curSeat.seatId, date: this.selectedDate.value } })
        await subscription
        uni.navigateTo({ url: `/pages/reserve/detail?reservationNo=${reservation.reservationNo}` })
      } catch (error) { showRequestError(error) } finally { this.submitting = false }
    },
    requestReminderSubscription() {
      const templateId = this.notificationTemplateId
      if (!templateId || typeof uni.requestSubscribeMessage !== 'function') return Promise.resolve()
      return new Promise((resolve) => {
        uni.requestSubscribeMessage({ tmplIds: [templateId], complete: () => resolve() })
      })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--xy-bg); }
.date-strip { white-space: nowrap; background: #fff; }
.date-row { display: inline-flex; gap: 16rpx; padding: 20rpx 28rpx; }
.date-item { width: 100rpx; padding: 16rpx 0; border-radius: 20rpx; text-align: center; color: var(--xy-ink-3); background: var(--xy-surface-2); }
.date-item.on { color: #fff; background: var(--xy-primary); }.day { display: block; margin-top: 6rpx; font-size: 36rpx; font-weight: 700; }
.wrap { padding: 28rpx; }.notice { padding: 20rpx; border-radius: 18rpx; color: var(--xy-primary-deep); background: var(--xy-mint); font-size: 24rpx; }
.section { display: flex; justify-content: space-between; margin-top: 32rpx; font-size: 30rpx; font-weight: 700; }.muted { font-size: 22rpx; font-weight: normal; color: var(--xy-muted); }
.slot-grid,.seat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18rpx; margin-top: 18rpx; }.slot,.seat { min-height: 92rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 18rpx; background: #fff; font-size: 24rpx; box-shadow: var(--xy-shadow); }.slot text:last-child { margin-top: 8rpx; color: var(--xy-success); font-size: 21rpx; }.slot.on,.seat.selected { color: #fff; background: var(--xy-primary); }.slot.on text:last-child { color: #fff; }.slot.full,.seat.booked { color: var(--xy-muted); background: #e8eeec; box-shadow: none; }.seat-grid { grid-template-columns: repeat(4, 1fr); }.seat { min-height: 76rpx; }
.empty { padding: 50rpx 0; text-align: center; color: var(--xy-muted); }.footer { position: fixed; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom) + 108rpx); display: flex; align-items: center; gap: 20rpx; padding: 20rpx 28rpx; background: #fff; box-shadow: 0 -4rpx 14rpx rgba(0,0,0,.06); }.summary { flex: 1; font-size: 23rpx; color: var(--xy-ink-3); }.submit { width: 210rpx; padding: 20rpx 0; border-radius: 20rpx; color: #fff; background: var(--xy-primary); font-size: 28rpx; }.submit[disabled] { background: #b7c5c1; }
</style>
