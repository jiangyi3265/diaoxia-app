<template>
  <view class="page">
    <xy-header title="预约选座" variant="brand" :show-back="false" />

    <view v-if="checkingMember" class="state-wrap"><xy-state type="loading" /></view>
    <xy-state v-else-if="memberError" type="error" title="会员状态加载失败" :description="memberError" action-text="重新加载" @action="initialize" />
    <view v-else-if="membershipRequired" class="member-required">
      <view class="member-icon"><xy-icon name="card" :size="62" color="#0B756E" /></view>
      <text class="member-title">预约服务面向有效会员</text>
      <text class="member-note">先提交会员申请，付款后即可在线选择时段和座位。</text>
      <button @click="openMembership">申请办理会员</button>
      <text @click="history">查看我的预约记录</text>
    </view>

    <block v-else>
      <view class="store-section">
        <view class="section-heading"><text>选择门店</text><text>{{ currentStore && currentStore.address || '请选择预约门店' }}</text></view>
        <scroll-view class="store-scroll" scroll-x :show-scrollbar="false">
          <view class="store-row">
            <view v-for="store in stores" :key="store.storeId" class="store-chip" :class="{ active: String(storeId) === String(store.storeId), disabled: loading }" @click="pickStore(store)">
              <xy-icon name="location" :size="28" :color="String(storeId) === String(store.storeId) ? '#F4FBF9' : '#0B756E'" />
              <text>{{ store.storeName }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <scroll-view class="date-strip" scroll-x :show-scrollbar="false">
        <view class="date-row">
          <view v-for="(date, index) in dates" :key="date.value" class="date-item" :class="{ on: selDate === index, disabled: loading }" @click="pickDate(index)">
            <text>{{ date.week }}</text><text class="day">{{ date.day }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="wrap">
        <view class="notice">{{ availabilityRule || '每位会员同时只能保留 1 个待到场预约；签到后可按门店规则续约当天更晚的空余时段。' }}</view>
        <view class="section"><text>选择时段</text></view>
        <view v-if="loading" class="slot-loading"><view v-for="i in 6" :key="i" class="xy-skeleton" /></view>
        <xy-state v-else-if="loadError" type="error" title="可约座位加载失败" :description="loadError" action-text="重新加载" @action="reloadAvailability()" />
        <view v-else-if="slots.length === 0" class="empty">该门店当天没有可预约时段</view>
        <view v-else class="slot-grid">
          <view v-for="(slot, index) in slots" :key="slot.slotId" class="slot" :class="{ on: selSlot === index, full: !canBookSlot(slot) }" @click="pickSlot(index)">
            <text>{{ slot.time }}</text><text>{{ slot.booked >= slot.total ? '已约满' : (!slot.bookable ? '已开始' : `剩余 ${slot.total - slot.booked} 座`) }}</text>
          </view>
        </view>

        <view class="section"><text>选择座位</text><text class="muted">绿色可约，灰色已约</text></view>
        <view v-if="!loading && !loadError && selectedSlot && !seats.length" class="empty">该时段暂时没有可用座位</view>
        <view class="seat-grid">
          <view v-for="seat in seats" :key="seat.seatId" class="seat" :class="seatClass(seat)" @click="pickSeat(seat)"><text>{{ seat.zone }}{{ seat.no }}</text></view>
        </view>
      </view>

      <view class="footer">
        <view class="summary"><text v-if="curSeat && selectedSlot">{{ selectedDate.full }} {{ selectedSlot.time }} · {{ curSeat.zone }}{{ curSeat.no }}</text><text v-else>{{ loading ? '正在更新可约座位' : '请选择时段和座位' }}</text></view>
        <button class="submit" :disabled="loading || !!loadError || !curSeat || submitting" @click="confirm">{{ submitting ? '提交中…' : '确认预约' }}</button>
      </view>
    </block>

    <view v-if="showRules" class="rules-mask" catchtouchmove="true">
      <view class="rules-dialog">
        <view class="rules-head"><view><text class="rules-kicker">预约前请阅读</text><text class="rules-title">钓虾规则须知</text></view><view class="rules-close" @click="showRules = false"><xy-icon name="close" :size="30" color="#6f827d" /></view></view>
        <view class="rules-list">
          <view><text>1</text><text>每位会员同时只能保留一个待到场预约，请按预约时段到店。</text></view>
          <view><text>2</text><text>到店后请向工作人员出示会员二维码，完成签到后使用对应座位。</text></view>
          <view><text>3</text><text>当前场次结束前 10 分钟起，可继续预约当天更晚且有空位的时段。</text></view>
          <view><text>4</text><text>如不能到店，请提前在“我的预约”中取消，已开始或已签到场次不能取消。</text></view>
        </view>
        <view class="rules-selection"><xy-icon name="calendar-check" :size="30" color="#0b756e" /><text>{{ currentStore && currentStore.storeName }} · {{ selectedDate.full }} {{ selectedSlot && selectedSlot.time }} · {{ curSeat && `${curSeat.zone}${curSeat.no}` }}</text></view>
        <view class="rules-actions"><button class="rules-cancel" @click="showRules = false">暂不预约</button><button class="rules-confirm" :disabled="loading || submitting" @click="submitReservation">已阅读，同意并预约</button></view>
      </view>
    </view>
    <view class="xy-tabbar-hold" /><xy-tabbar active="reserve" />
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, publicRequest, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      stores: [], storeId: null, dates: [], selDate: 0, slots: [], selSlot: 0, seats: [], curSeat: null,
      checkingMember: true, membershipRequired: false, memberError: '', loading: false, loadError: '',
      submitting: false, showRules: false, availabilityRule: '', notificationTemplateId: ''
    }
  },
  computed: {
    currentStore() { return this.stores.find(store => String(store.storeId) === String(this.storeId)) || null },
    selectedDate() { return this.dates[this.selDate] || {} },
    selectedSlot() { return this.slots[this.selSlot] || null }
  },
  onLoad() { this.buildDates(); this.initialize() },
  methods: {
    buildDates() {
      const weeks = ['日', '一', '二', '三', '四', '五', '六']
      const today = new Date()
      this.dates = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
        const value = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
        return { value, full: value, week: index === 0 ? '今天' : `周${weeks[date.getDay()]}`, day: String(date.getDate()).padStart(2, '0') }
      })
    },
    resetAvailability() { this.slots = []; this.seats = []; this.curSeat = null; this.selSlot = 0 },
    async initialize() {
      this.checkingMember = true
      this.membershipRequired = false
      this.memberError = ''
      this.loadError = ''
      this.resetAvailability()
      try {
        await ensureMemberSession()
        const me = await appRequest({ url: '/app/me' })
        if (!this.hasActiveCard(me && me.card)) { this.membershipRequired = true; return }
        const [stores, settings] = await Promise.all([
          publicRequest({ url: '/app/stores' }),
          publicRequest({ url: '/app/notification-settings' }).catch(() => ({}))
        ])
        if (!stores.length) throw new Error('暂无可预约门店，请联系商家')
        this.stores = stores
        if (!stores.some(store => String(store.storeId) === String(this.storeId))) this.storeId = stores[0].storeId
        this.notificationTemplateId = settings.reservationReminderTemplateId || ''
        await this.reloadAvailability()
      } catch (error) {
        this.memberError = (error && error.message) || '网络连接失败'
      } finally { this.checkingMember = false }
    },
    async reloadAvailability(preferredSlotId = null) {
      if (!this.storeId || !this.selectedDate.value || this.membershipRequired) return
      this.loading = true
      this.loadError = ''
      this.resetAvailability()
      try { await this.loadAvailability(preferredSlotId) }
      catch (error) { this.loadError = (error && error.message) || '网络连接失败' }
      finally { this.loading = false }
    },
    async loadAvailability(preferredSlotId) {
      const data = await publicRequest({ url: `/app/stores/${this.storeId}/availability`, data: { date: this.selectedDate.value } })
      this.slots = (data.slots || []).map(slot => ({ slotId: slot.slotId, time: `${slot.startTime}-${slot.endTime}`, total: Number(slot.totalCount), booked: Number(slot.bookedCount), bookable: slot.bookable !== false }))
      this.availabilityRule = data.sameDayRolloverRule || this.availabilityRule
      let index = preferredSlotId == null ? -1 : this.slots.findIndex(slot => String(slot.slotId) === String(preferredSlotId) && this.canBookSlot(slot))
      if (index < 0) index = this.slots.findIndex(slot => this.canBookSlot(slot))
      this.selSlot = index >= 0 ? index : 0
      const slotId = index >= 0 && this.slots[index] ? this.slots[index].slotId : null
      this.seats = slotId == null ? [] : (data.seats || []).map(seat => ({
        seatId: seat.seatId, zone: seat.zoneName || '', no: seat.seatCode,
        status: String(seat.bookedSlotIds || '').split(',').includes(String(slotId)) ? 'booked' : 'free'
      }))
    },
    async pickStore(store) { if (this.loading || String(this.storeId) === String(store.storeId)) return; this.storeId = store.storeId; await this.reloadAvailability() },
    async pickDate(index) { if (this.loading || index === this.selDate) return; this.selDate = index; await this.reloadAvailability() },
    async pickSlot(index) {
      if (this.loading || this.loadError) return
      const slot = this.slots[index]
      if (!this.canBookSlot(slot)) { uni.showToast({ title: slot && slot.booked >= slot.total ? '该时段已约满' : '该时段已开始，不能预约', icon: 'none' }); return }
      await this.reloadAvailability(slot.slotId)
    },
    canBookSlot(slot) { return !!slot && slot.bookable && slot.booked < slot.total },
    hasActiveCard(card) {
      if (!card) return false
      const status = String(card.status || card.cardStatus || '').toUpperCase()
      if (status && !['ACTIVE', 'VALID', 'ENABLED'].includes(status)) return false
      if (card.expireDate) {
        const expiresAt = new Date(`${String(card.expireDate).slice(0, 10)}T23:59:59`)
        if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) return false
      }
      return true
    },
    pickSeat(seat) { if (this.loading || this.loadError || seat.status === 'booked') return; this.curSeat = this.curSeat && this.curSeat.seatId === seat.seatId ? null : seat },
    seatClass(seat) { return seat.status === 'booked' ? 'booked' : this.curSeat && this.curSeat.seatId === seat.seatId ? 'selected' : 'free' },
    confirm() { if (this.loading || this.loadError || !this.curSeat || !this.selectedSlot || this.submitting) return; this.showRules = true },
    async submitReservation() {
      if (this.loading || this.membershipRequired || !this.curSeat || !this.selectedSlot || this.submitting) return
      this.submitting = true
      this.showRules = false
      try {
        const subscription = this.requestReminderSubscription()
        const reservation = await appRequest({ url: '/app/reservations', method: 'POST', data: { storeId: this.storeId, slotId: this.selectedSlot.slotId, seatId: this.curSeat.seatId, date: this.selectedDate.value } })
        await subscription
        uni.navigateTo({ url: `/pages/reserve/detail?reservationNo=${reservation.reservationNo}` })
      } catch (error) { showRequestError(error) } finally { this.submitting = false }
    },
    requestReminderSubscription() {
      if (!this.notificationTemplateId || typeof uni.requestSubscribeMessage !== 'function') return Promise.resolve()
      return new Promise(resolve => uni.requestSubscribeMessage({ tmplIds: [this.notificationTemplateId], complete: () => resolve() }))
    },
    openMembership() { uni.navigateTo({ url: '/pages/membership/join' }) },
    history() { uni.navigateTo({ url: '/pages/reserve/history' }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:var(--xy-bg)}.state-wrap{padding:28rpx}.member-required{display:flex;flex-direction:column;align-items:center;padding:110rpx 48rpx 40rpx;text-align:center}.member-icon{display:flex;width:112rpx;height:112rpx;align-items:center;justify-content:center;border-radius:34rpx;background:#dcefe9}.member-title{margin-top:26rpx;color:#19332e;font-size:32rpx;font-weight:750}.member-note{max-width:29em;margin-top:13rpx;color:#718681;font-size:23rpx;line-height:1.65}.member-required button{height:86rpx;margin-top:28rpx;padding:0 38rpx;border-radius:24rpx;background:#0b8d84;color:#f4fbf9;font-size:25rpx;font-weight:700;line-height:86rpx}.member-required>text:last-child{margin-top:22rpx;color:#55766f;font-size:22rpx}.store-section{padding:24rpx 0 12rpx;background:#f8fcfa}.section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:20rpx;padding:0 28rpx 17rpx}.section-heading text:first-child{color:#1d3833;font-size:27rpx;font-weight:750}.section-heading text:last-child{max-width:430rpx;overflow:hidden;color:#7a8d88;font-size:19rpx;text-overflow:ellipsis;white-space:nowrap}.store-scroll{width:100%;white-space:nowrap}.store-row{display:inline-flex;gap:14rpx;padding:0 28rpx 10rpx}.store-chip{display:flex;align-items:center;gap:9rpx;height:68rpx;padding:0 22rpx;border:1rpx solid #d3e5e0;border-radius:21rpx;background:#e7f2ef;color:#31574f;font-size:23rpx}.store-chip.active{border-color:#0b8d84;background:#0b8d84;color:#f4fbf9}.store-chip.disabled{opacity:.55}.date-strip{white-space:nowrap;background:#fff}.date-row{display:inline-flex;gap:16rpx;padding:20rpx 28rpx}.date-item{width:100rpx;padding:16rpx 0;border-radius:20rpx;text-align:center;color:var(--xy-ink-3);background:var(--xy-surface-2)}.date-item.on{color:#fff;background:var(--xy-primary)}.date-item.disabled{opacity:.58}.day{display:block;margin-top:6rpx;font-size:36rpx;font-weight:700}.wrap{padding:28rpx}.notice{padding:20rpx;border-radius:18rpx;color:var(--xy-primary-deep);background:var(--xy-mint);font-size:23rpx;line-height:1.55}.section{display:flex;justify-content:space-between;margin-top:32rpx;font-size:30rpx;font-weight:700}.muted{font-size:22rpx;font-weight:normal;color:var(--xy-muted)}.slot-grid,.seat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18rpx;margin-top:18rpx}.slot,.seat{display:flex;min-height:92rpx;flex-direction:column;align-items:center;justify-content:center;border-radius:18rpx;background:#fff;font-size:24rpx;box-shadow:var(--xy-shadow)}.slot text:last-child{margin-top:8rpx;color:var(--xy-success);font-size:21rpx}.slot.on,.seat.selected{color:#fff;background:var(--xy-primary)}.slot.on text:last-child{color:#fff}.slot.full,.seat.booked{color:var(--xy-muted);background:#e8eeec;box-shadow:none}.seat-grid{grid-template-columns:repeat(4,1fr)}.seat{min-height:76rpx}.empty{padding:50rpx 0;text-align:center;color:var(--xy-muted)}.footer{position:fixed;z-index:30;right:0;bottom:calc(env(safe-area-inset-bottom) + 108rpx);left:0;display:flex;align-items:center;gap:20rpx;padding:20rpx 28rpx;background:#fff;box-shadow:0 -4rpx 18rpx rgba(18,72,66,.08)}.summary{flex:1;color:var(--xy-ink-3);font-size:22rpx}.submit{width:230rpx;height:78rpx;border-radius:20rpx;color:#fff;background:var(--xy-primary);font-size:27rpx;line-height:78rpx}.submit[disabled]{background:#b7c5c1}.slot-loading{display:grid;grid-template-columns:repeat(3,1fr);gap:18rpx;margin-top:18rpx}.slot-loading view{height:92rpx;border-radius:18rpx}.rules-mask{position:fixed;z-index:2000;inset:0;display:flex;align-items:center;justify-content:center;padding:36rpx;background:rgba(18,40,36,.58)}.rules-dialog{width:100%;max-width:650rpx;overflow:hidden;border-radius:34rpx;background:#f8fcfa;box-shadow:0 34rpx 80rpx rgba(10,48,43,.24)}.rules-head{display:flex;align-items:center;justify-content:space-between;padding:32rpx 32rpx 24rpx;border-bottom:1rpx solid #dfeae7}.rules-head>view:first-child{display:flex;flex-direction:column;gap:7rpx}.rules-kicker{color:#0b8d84;font-size:20rpx;font-weight:700;letter-spacing:2rpx}.rules-title{color:#18332e;font-size:34rpx;font-weight:850}.rules-close{display:flex;width:62rpx;height:62rpx;align-items:center;justify-content:center;border-radius:20rpx;background:#e8f0ee}.rules-list{display:flex;flex-direction:column;gap:22rpx;padding:28rpx 32rpx}.rules-list>view{display:flex;align-items:flex-start;gap:16rpx;color:#536b65;font-size:23rpx;line-height:1.55}.rules-list>view>text:first-child{display:flex;flex:0 0 38rpx;width:38rpx;height:38rpx;align-items:center;justify-content:center;border-radius:13rpx;background:#dcefe9;color:#0b756e;font-size:20rpx;font-weight:800;line-height:38rpx}.rules-list>view>text:last-child{flex:1}.rules-selection{display:flex;align-items:center;gap:13rpx;margin:0 32rpx;padding:20rpx 22rpx;border-radius:20rpx;background:#e4f3ef;color:#24433d;font-size:21rpx;font-weight:650}.rules-selection text{flex:1}.rules-actions{display:flex;gap:14rpx;padding:26rpx 32rpx 32rpx}.rules-actions button{height:84rpx;margin:0;border-radius:22rpx;font-size:24rpx;font-weight:750;line-height:84rpx}.rules-cancel{width:190rpx;border:1rpx solid #d4e1de;background:#f8fcfa;color:#61756f}.rules-confirm{flex:1;background:#0b8d84;color:#f4fbf9}.rules-confirm[disabled]{background:#afc2be}
</style>
