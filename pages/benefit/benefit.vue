<template>
  <view class="page">
    <xy-header title="福利钓专场" variant="brand" />

    <scroll-view scroll-y class="page-scroll">
      <view class="intro">
        <view><text class="intro-kicker">每日福利钓</text><text class="intro-title">选一席，等你开钓</text><text class="intro-note">20:15–22:15 · 19:30截止 · 每场独立定价</text></view>
        <view class="intro-mark"><xy-icon name="medal" :size="58" color="#F8EBD4" :weight="1.6" /></view>
      </view>

      <view class="toolbar">
        <view><text class="section-title">未来场次</text><text class="section-note">每场限报一个位置</text></view>
        <button @click="openHistory">我的报名</button>
      </view>

      <xy-state v-if="loading" type="loading" />
      <xy-state v-else-if="error" type="error" title="场次加载失败" :description="error" action-text="重新加载" @action="load" />
      <view v-else-if="!events.length" class="empty">
        <view class="empty-icon"><xy-icon name="calendar" :size="54" color="#7C948E" /></view>
        <text class="empty-title">暂未开放福利钓专场</text>
        <text class="empty-note">商家开放未来场次后会显示在这里，请稍后再来看看。</text>
      </view>
      <template v-else>
        <scroll-view scroll-x class="event-strip" :show-scrollbar="false">
          <view class="event-strip-inner">
            <view v-for="item in events" :key="item.eventId" class="event-card" :class="{ active: item.eventId === activeId, closed: !item.signupOpen }" @click="chooseEvent(item)">
              <text class="event-week">{{ weekName(item.eventDate) }}</text>
              <text class="event-day">{{ dayNumber(item.eventDate) }}</text>
              <text class="event-state">{{ item.displayStatus }}</text>
            </view>
          </view>
        </scroll-view>

        <view v-if="active" class="event-summary">
          <view class="summary-main"><text>{{ fullDate(active.eventDate) }}</text><text>{{ active.storeName }}</text></view>
          <view class="summary-stats"><view><text>¥{{ money(active.feeAmount) }}</text><text>报名费</text></view><view><text>{{ active.remainingCount }}</text><text>剩余位置</text></view><view><text>19:30</text><text>报名截止</text></view></view>
          <view class="announcement-preview"><view><xy-icon name="bell" :size="31" color="#8A5A27" /><text>本场公告</text></view><text>{{ active.announcement }}</text><button @click="openAnnouncement">完整阅读</button></view>
        </view>

        <view v-if="active && announcementConfirmed" class="seat-section">
          <view class="seat-head"><view><text class="section-title">选择座位</text><text class="section-note">33平方小池 · 每场限选一个</text></view><view class="legend"><text><i class="available"></i>可选</text><text><i class="selected"></i>已选</text><text><i class="unavailable"></i>已报名</text></view></view>
          <view class="map-scroll-hint">左侧1–9，右侧10–18；上边19–20，下边21–22</view>
          <view class="pool-map portrait-map">
            <view class="short-seats"><button v-for="n in topSeats" :key="n" :class="seatClass(n)" :aria-label="seatLabel(n)" :disabled="seatUnavailable(n)" @click="selectSeat(n)">{{ selectedSeat === n ? `✓ ${n}` : n }}</button></view>
            <view class="pool-middle">
              <view class="long-seats"><button v-for="n in leftSeats" :key="n" :class="seatClass(n)" :aria-label="seatLabel(n)" :disabled="seatUnavailable(n)" @click="selectSeat(n)">{{ selectedSeat === n ? `✓ ${n}` : n }}</button></view>
              <view class="pool"><text>33平方小池</text><text>福利钓专场</text></view>
              <view class="long-seats"><button v-for="n in rightSeats" :key="n" :class="seatClass(n)" :aria-label="seatLabel(n)" :disabled="seatUnavailable(n)" @click="selectSeat(n)">{{ selectedSeat === n ? `✓ ${n}` : n }}</button></view>
            </view>
            <view class="short-seats"><button v-for="n in bottomSeats" :key="n" :class="seatClass(n)" :aria-label="seatLabel(n)" :disabled="seatUnavailable(n)" @click="selectSeat(n)">{{ selectedSeat === n ? `✓ ${n}` : n }}</button></view>
          </view>

          <view v-if="active.myBookingStatus" class="my-current">
            <xy-icon name="info" :size="31" color="#0B756E" />
            <view>
              <text>你在本场的状态：{{ active.myBookingStatus }}<template v-if="active.mySeatNo">，座位{{ active.mySeatNo}}号</template></text>
              <text v-if="canContinuePayment">座位还为你保留 {{ countdownText(paymentRemainingSeconds) }}，可在下方继续支付。</text>
              <text v-else-if="isPaymentPending && paymentRemainingSeconds <= 0">锁座已到期，请刷新后重新选座。</text>
              <text v-else-if="isPaymentPending">支付状态正在确认，请稍后刷新。</text>
            </view>
          </view>

          <view v-if="authenticated && !me.mobileVerified" class="mobile-gate">
            <view><text>验证报名手机号</text><text>请使用微信验证手机号。后台录入的号码也需要本人完成一次验证。</text></view>
            <button open-type="getPhoneNumber" @getphonenumber="bindWechatMobile">授权手机号</button>
          </view>
        </view>
      </template>
      <view class="action-space"></view>
    </scroll-view>

    <view v-if="active && announcementConfirmed" class="action-bar">
      <view><text>{{ selectedSeat ? `${selectedSeat}号座位` : '请选择座位' }}</text><text>{{ actionHint }}</text></view>
      <button :disabled="!canSubmit || paying" :loading="paying" @click="pay">{{ submitText }}</button>
    </view>

    <view v-if="announcementOpen" class="notice-overlay" @click.self="announcementOpen=false">
      <view class="notice-sheet">
        <view class="notice-head"><view><text>福利钓专场公告</text><text>{{ active.eventDate }} · 20:15–22:15</text></view><button aria-label="关闭公告" @click="announcementOpen=false"><xy-icon name="close" :size="32" color="#60756F" /></button></view>
        <scroll-view scroll-y class="notice-scroll"><text>{{ active.announcement }}</text><view class="notice-rule"><text>报名截止</text><text>当天19:30</text></view><view class="notice-rule"><text>报名费用</text><text>¥{{ money(active.feeAmount) }}/位</text></view><view class="notice-rule"><text>报名限制</text><text>每位用户本场限报一个位置</text></view><view class="notice-rule"><text>报名说明</text><text>报名成功后不可自行取消，如有特殊情况请联系商家。</text></view></scroll-view>
        <button class="notice-confirm" @click="confirmAnnouncement">我已阅读并确认公告</button>
      </view>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, hasMemberSession, hasPrivacyConsent, publicRequest, showRequestError } from '../../utils/api'

export default {
  data() {
    return {
      events: [], active: null, activeId: null, selectedSeat: null,
      loading: true, error: '', announcementOpen: false, announcementConfirmed: false,
      authenticated: false, me: {}, paying: false, pendingPayment: null,
      paymentRemainingSeconds: 0, paymentTimer: null, bookingPollTimer: null,
      pageVisible: true, requestedEventId: null,
      startTemplateId: '', cancelTemplateId: '',
      topSeats: [19,20], bottomSeats: [21,22],
      leftSeats: [1,2,3,4,5,6,7,8,9], rightSeats: [10,11,12,13,14,15,16,17,18]
    }
  },
  computed: {
    seatMap() { const map = {}; for (const seat of (this.active?.seats || [])) map[Number(seat.seatNo)] = seat.status; return map },
    hasActiveBooking() { return ['已报名','报名确认中'].includes(this.active?.myBookingStatus) },
    isPaymentPending() { return this.active?.myBookingStatus === '报名确认中' },
    canContinuePayment() { return !!(this.isPaymentPending && this.active?.myCanContinuePayment && this.paymentRemainingSeconds > 0) },
    canSubmit() {
      if (this.isPaymentPending) return !!(this.authenticated && this.active?.myBookingNo
        && (this.canContinuePayment || this.paymentRemainingSeconds <= 0) && !this.paying)
      return !!(this.active?.signupOpen && this.announcementConfirmed && this.selectedSeat && !this.hasActiveBooking && (!this.authenticated || this.me.mobileVerified))
    },
    actionHint() {
      if (this.isPaymentPending) return this.canContinuePayment ? `锁座剩余 ${this.countdownText(this.paymentRemainingSeconds)}` : this.paymentRemainingSeconds <= 0 ? '锁座已到期' : '支付状态确认中'
      return this.selectedSeat ? `应付 ¥${this.money(this.active?.feeAmount)}` : this.active?.displayStatus
    },
    submitText() {
      if (this.isPaymentPending) return this.canContinuePayment ? '继续支付' : this.paymentRemainingSeconds <= 0 ? '刷新状态' : '状态确认中'
      if (this.hasActiveBooking) return this.active.myBookingStatus
      if (!this.active?.signupOpen) return this.active?.displayStatus || '当前不可报名'
      if (!this.authenticated) return '登录后报名'
      if (!this.me.mobileVerified) return '请先验证手机号'
      if (!this.selectedSeat) return '选择一个座位'
      return this.pendingPayment ? '继续微信支付' : `微信支付 ¥${this.money(this.active?.feeAmount)}`
    }
  },
  onLoad(options) {
    const eventId = Number(options?.eventId || 0)
    this.requestedEventId = eventId > 0 ? eventId : null
    this.loadNotificationSettings()
  },
  onShow() { this.pageVisible = true; this.load() },
  onHide() { this.pageVisible = false; this.stopPaymentCountdown(); this.stopBookingPoll() },
  onUnload() { this.pageVisible = false; this.stopPaymentCountdown(); this.stopBookingPoll() },
  methods: {
    async load() {
      this.loading = true; this.error = ''
      try {
        this.authenticated = hasMemberSession() && hasPrivacyConsent()
        if (this.authenticated) {
          try { this.me = await appRequest({ url: '/app/me', redirectOnUnauthorized: false }) } catch (error) { this.authenticated = false; this.me = {} }
        }
        this.events = await (this.authenticated ? appRequest({ url: '/app/benefit-events', redirectOnUnauthorized: false }) : publicRequest({ url: '/app/benefit-events' }))
        const target = this.events.find(item => Number(item.eventId) === Number(this.requestedEventId))
          || this.events.find(item => item.eventId === this.activeId) || this.events[0]
        this.requestedEventId = null
        if (target) await this.loadEvent(target.eventId, false)
        else { this.active = null; this.activeId = null }
      } catch (error) { this.error = (error && error.message) || '暂时无法读取福利钓场次' }
      finally { this.loading = false }
    },
    async loadEvent(eventId, reset = true) {
      const wasPending = this.isPaymentPending
      const data = await (this.authenticated ? appRequest({ url: `/app/benefit-events/${eventId}`, redirectOnUnauthorized: false }) : publicRequest({ url: `/app/benefit-events/${eventId}` }))
      this.active = data; this.activeId = data.eventId
      if (data.myBookingStatus === '报名确认中' && data.mySeatNo) {
        this.selectedSeat = Number(data.mySeatNo)
        this.announcementConfirmed = true
      } else if (reset || wasPending) {
        this.selectedSeat = null; this.pendingPayment = null; this.announcementConfirmed = false
      }
      this.startPaymentCountdown(data.myPaymentRemainingSeconds)
    },
    async chooseEvent(item) {
      if (item.eventId === this.activeId && this.announcementConfirmed) return
      try { await this.loadEvent(item.eventId); this.openAnnouncement() } catch (error) { showRequestError(error) }
    },
    openAnnouncement() { if (this.active) this.announcementOpen = true },
    confirmAnnouncement() { this.announcementConfirmed = true; this.announcementOpen = false },
    seatUnavailable(no) { return this.seatMap[no] !== 'AVAILABLE' },
    seatClass(no) { return ['map-seat', this.selectedSeat === no ? 'selected' : this.seatUnavailable(no) ? 'unavailable' : 'available'] },
    seatLabel(no) { return `${no}号座位，${this.selectedSeat === no ? '已选择' : this.seatUnavailable(no) ? '已报名' : '可选择'}` },
    selectSeat(no) { if (this.seatUnavailable(no) || this.hasActiveBooking) return; this.selectedSeat = no; this.pendingPayment = null },
    async pay() {
      if (!this.authenticated) { uni.navigateTo({ url: '/pages/login/login?redirect=benefit' }); return }
      if (!this.me.mobileVerified) { uni.showToast({ title: '请先验证微信手机号', icon: 'none' }); return }
      if (!this.canSubmit || this.paying) return
      this.paying = true
      try {
        await ensureMemberSession()
        if (this.isPaymentPending) {
          if (this.paymentRemainingSeconds <= 0) {
            await this.loadEvent(this.activeId, false)
            if (this.isPaymentPending) uni.showToast({ title: '锁座状态正在同步，请稍后刷新', icon: 'none' })
            this.paying = false
            return
          }
          const payment = await appRequest({ url: `/app/benefit-bookings/${encodeURIComponent(this.active.myBookingNo)}/payment`, method: 'POST' })
          if (payment.paid) { await this.finishPaidBooking(); return }
          this.pendingPayment = payment
          this.requestPayment(payment)
          return
        }
        if (this.pendingPayment) { this.requestPayment(this.pendingPayment); return }
        const consent = await this.requestNoticeConsent()
        const payment = await appRequest({ url: `/app/benefit-events/${this.activeId}/bookings/payment`, method: 'POST', data: { seatNo: this.selectedSeat, announcementVersion: this.active.announcementVersion, announcementConfirmed: true, startNoticeAccepted: consent.start, cancelNoticeAccepted: consent.cancel } })
        if (payment.paid) { await this.finishPaidBooking(); return }
        this.pendingPayment = payment
        this.requestPayment(payment)
      } catch (error) {
        this.paying = false
        showRequestError(error)
        await this.loadEvent(this.activeId, false).catch(() => {})
      }
    },
    requestPayment(payment) {
      this.paying = true
      uni.requestPayment({ ...payment,
        success: () => { uni.showToast({ title: '付款完成，正在确认报名', icon: 'none' }); this.waitForBooking(0) },
        fail: () => {
          uni.showToast({ title: '支付未完成，可在保留时间内继续支付', icon: 'none' })
          this.paying = false
          this.loadEvent(this.activeId, false).catch(() => {})
        }
      })
    },
    async finishPaidBooking() {
      this.stopBookingPoll()
      this.pendingPayment = null; this.selectedSeat = null
      try {
        await this.loadEvent(this.activeId, false)
        const booked = this.active?.myBookingStatus === '已报名'
        uni.showToast({ title: booked ? '报名成功' : '状态已同步', icon: booked ? 'success' : 'none' })
      } finally { this.paying = false }
    },
    async waitForBooking(attempt) {
      if (!this.pageVisible) { this.paying = false; this.stopBookingPoll(); return }
      try {
        await this.loadEvent(this.activeId, false)
        if (this.active.myBookingStatus === '已报名') { this.stopBookingPoll(); this.pendingPayment = null; this.selectedSeat = null; this.paying = false; uni.showToast({ title: '报名成功', icon: 'success' }); return }
      } catch (error) {}
      if (attempt >= 5) { this.stopBookingPoll(); this.paying = false; uni.showModal({ title: '报名正在确认', content: '微信支付结果正在同步，请稍后在“我的报名”中查看。', showCancel: false, confirmColor: '#0B756E' }); return }
      this.stopBookingPoll()
      this.bookingPollTimer = setTimeout(() => this.waitForBooking(attempt + 1), 1000)
    },
    async loadNotificationSettings() {
      try { const data = await publicRequest({ url: '/app/notification-settings' }); this.startTemplateId = data.benefitStartTemplateId || ''; this.cancelTemplateId = data.benefitCancelTemplateId || '' } catch (error) {}
    },
    requestNoticeConsent() {
      const ids = [this.startTemplateId, this.cancelTemplateId].filter(Boolean)
      if (!ids.length || typeof uni.requestSubscribeMessage !== 'function') return Promise.resolve({ start: false, cancel: false })
      return new Promise(resolve => uni.requestSubscribeMessage({ tmplIds: ids, success: result => resolve({ start: result[this.startTemplateId] === 'accept', cancel: result[this.cancelTemplateId] === 'accept' }), fail: () => resolve({ start: false, cancel: false }) }))
    },
    async bindWechatMobile(event) {
      const code = event?.detail?.code
      if (!code) { uni.showToast({ title: '未完成手机号授权', icon: 'none' }); return }
      try { this.me = await appRequest({ url: '/app/me/wechat-mobile', method: 'POST', data: { code } }); uni.showToast({ title: '手机号已确认', icon: 'success' }) } catch (error) { showRequestError(error) }
    },
    startPaymentCountdown(value) {
      this.stopPaymentCountdown()
      this.paymentRemainingSeconds = Math.max(0, Number(value || 0))
      if (!this.isPaymentPending || this.paymentRemainingSeconds <= 0) return
      this.paymentTimer = setInterval(() => {
        this.paymentRemainingSeconds = Math.max(0, this.paymentRemainingSeconds - 1)
        if (this.paymentRemainingSeconds === 0) {
          this.stopPaymentCountdown()
          if (this.isPaymentPending && this.activeId) this.loadEvent(this.activeId, false).catch(() => {})
        }
      }, 1000)
    },
    stopPaymentCountdown() {
      if (this.paymentTimer) clearInterval(this.paymentTimer)
      this.paymentTimer = null
    },
    stopBookingPoll() {
      if (this.bookingPollTimer) clearTimeout(this.bookingPollTimer)
      this.bookingPollTimer = null
    },
    countdownText(value) {
      const seconds = Math.max(0, Number(value || 0))
      const minutes = Math.floor(seconds / 60)
      return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
    },
    money(value) { return Number(value || 0).toFixed(2) },
    openHistory() { if (!this.authenticated) uni.navigateTo({ url: '/pages/login/login?redirect=benefit' }); else uni.navigateTo({ url: '/pages/benefit/history' }) },
    weekName(value) { const date = new Date(`${value}T12:00:00`); const names = ['周日','周一','周二','周三','周四','周五','周六']; const today = new Date(); return date.toDateString() === today.toDateString() ? '今天' : names[date.getDay()] },
    dayNumber(value) { return Number(String(value).split('-')[2]) },
    fullDate(value) { const [y,m,d] = String(value).split('-'); return `${y}年${Number(m)}月${Number(d)}日` }
  }
}
</script>

<style scoped>
.page{display:flex;height:100vh;overflow:hidden;flex-direction:column;background:#edf5f3;color:#18322e}.page-scroll{height:0;min-height:0;flex:1}.intro{display:flex;align-items:flex-start;justify-content:space-between;margin:22rpx 24rpx 0;padding:30rpx;border-radius:34rpx;background:#7f5529;color:#fcf5e8;box-shadow:0 18rpx 38rpx rgba(91,58,24,.16)}.intro>view:first-child{display:flex;flex-direction:column}.intro-kicker{font-size:20rpx;font-weight:700;letter-spacing:3rpx;opacity:.75}.intro-title{margin-top:12rpx;font-size:40rpx;font-weight:800}.intro-note{margin-top:12rpx;font-size:22rpx;opacity:.82}.intro-mark{display:flex;align-items:center;justify-content:center;width:84rpx;height:84rpx;border-radius:26rpx;background:rgba(255,247,232,.12)}.toolbar{display:flex;align-items:center;justify-content:space-between;margin:34rpx 28rpx 16rpx}.toolbar>view,.seat-head>view:first-child{display:flex;flex-direction:column;gap:5rpx}.section-title{font-size:30rpx;font-weight:780}.section-note{color:#536c66;font-size:21rpx}.toolbar button{height:88rpx;margin:0;padding:0 24rpx;border:1rpx solid #cfe2dd;border-radius:24rpx;background:#f8fcfa;color:#0b756e;font-size:22rpx;line-height:86rpx}.event-strip{width:100%;white-space:nowrap}.event-strip-inner{display:inline-flex;gap:14rpx;padding:0 24rpx 12rpx}.event-card{display:inline-flex;width:128rpx;height:154rpx;align-items:center;justify-content:center;flex-direction:column;border:2rpx solid #dce9e5;border-radius:26rpx;background:#f8fcfa}.event-card.active{border-color:#0b8d84;background:#0b8d84;color:#f4fbf9}.event-card.closed:not(.active){opacity:.7}.event-week{font-size:21rpx}.event-day{margin:8rpx 0;font-size:40rpx;font-weight:800}.event-state{font-size:18rpx;opacity:.78}.event-summary{margin:16rpx 24rpx 0;padding:26rpx;border:1rpx solid #dbe8e4;border-radius:30rpx;background:#f8fcfa}.summary-main{display:flex;justify-content:space-between;gap:16rpx}.summary-main text:first-child{font-size:29rpx;font-weight:780}.summary-main text:last-child{color:#637a74;font-size:21rpx}.summary-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:22rpx;padding:20rpx 0;border-top:1rpx solid #e2ece9;border-bottom:1rpx solid #e2ece9}.summary-stats view{display:flex;align-items:center;flex-direction:column;gap:5rpx}.summary-stats view+view{border-left:1rpx solid #dfe9e6}.summary-stats text:first-child{font-size:28rpx;font-weight:780}.summary-stats text:last-child{color:#526963;font-size:18rpx}.announcement-preview{position:relative;margin-top:20rpx;padding:18rpx 20rpx;border-radius:22rpx;background:#fbf3e4}.announcement-preview>view{display:flex;align-items:center;gap:10rpx;color:#70491d;font-size:23rpx;font-weight:750}.announcement-preview>text{display:-webkit-box;overflow:hidden;margin-top:10rpx;color:#7c654a;font-size:21rpx;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:2}.announcement-preview button{height:88rpx;margin:14rpx 0 0;padding:0 24rpx;border-radius:23rpx;background:#ead8b9;color:#70491d;font-size:21rpx;line-height:88rpx}.seat-section{margin-top:28rpx;padding:0 24rpx}.seat-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14rpx}.legend{display:flex;gap:11rpx;color:#526963;font-size:18rpx}.legend text{display:flex;align-items:center;gap:5rpx}.legend i{display:inline-block;width:13rpx;height:13rpx;border-radius:4rpx}.legend .available{background:#f8fcfa;border:1rpx solid #bdd8d2}.legend .selected{background:#0b8d84}.legend .unavailable{background:#cfdad7}.map-scroll-hint{margin-top:16rpx;color:#526963;font-size:19rpx}.pool-map-scroll{width:100%;margin-top:12rpx}.pool-map{width:900rpx;box-sizing:border-box;padding:20rpx;border-radius:30rpx;background:#dfeeea}.seat-row{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:9rpx}.pool-middle{display:grid;grid-template-columns:88rpx minmax(0,1fr) 88rpx;gap:12rpx;margin:12rpx 0}.side-seats{display:flex;justify-content:space-around;flex-direction:column;gap:12rpx}.pool{display:flex;min-height:282rpx;align-items:center;justify-content:center;flex-direction:column;border:3rpx solid #79b7ac;border-radius:30rpx;background:#cce9e2;color:#145e55}.pool text:first-child{font-size:39rpx;font-weight:850;letter-spacing:1rpx}.pool text:last-child{margin-top:10rpx;color:#5c8179;font-size:20rpx}.map-seat{min-width:0;height:88rpx;margin:0;padding:0;border:2rpx solid transparent;border-radius:22rpx;font-size:22rpx;font-weight:760;line-height:88rpx}.map-seat.available{border-color:#a9cec5;background:#f9fcfb;color:#31564e}.map-seat.selected{background:#0b8d84;color:#f4fbf9;box-shadow:0 7rpx 16rpx rgba(11,117,110,.22)}.map-seat.unavailable{border-color:#6f8580;border-style:dashed;background:#cdd9d6;color:#536a64;text-decoration:line-through;opacity:1}.my-current{display:flex;align-items:center;gap:12rpx;margin-top:16rpx;padding:18rpx 20rpx;border-radius:22rpx;background:#e3f2ed;color:#315c54;font-size:21rpx}.mobile-gate{display:flex;align-items:center;gap:15rpx;margin-top:16rpx;padding:20rpx;border:1rpx solid #e5d3b6;border-radius:24rpx;background:#fbf5e9}.mobile-gate>view{display:flex;flex:1;flex-direction:column;gap:5rpx}.mobile-gate>view text:first-child{font-size:23rpx;font-weight:750}.mobile-gate>view text:last-child{color:#7c6b55;font-size:19rpx;line-height:1.45}.mobile-gate button{height:88rpx;margin:0;padding:0 22rpx;border-radius:23rpx;background:#8a5a27;color:#fff7e9;font-size:21rpx;line-height:88rpx}.action-space{height:calc(160rpx + env(safe-area-inset-bottom))}.action-bar{position:fixed;right:0;bottom:0;left:0;z-index:40;display:flex;align-items:center;gap:20rpx;padding:18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));border-top:1rpx solid #dce8e5;background:#f8fcfa}.action-bar>view{display:flex;flex:1;flex-direction:column;gap:4rpx}.action-bar>view text:first-child{font-size:25rpx;font-weight:780}.action-bar>view text:last-child{color:#7a8e89;font-size:19rpx}.action-bar button{width:310rpx;height:88rpx;margin:0;border-radius:24rpx;background:#0b8d84;color:#f4fbf9;font-size:25rpx;font-weight:750;line-height:88rpx}.action-bar button[disabled]{background:#c3d0cd;color:#4f6560}.notice-overlay{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;background:rgba(16,39,35,.46)}.notice-sheet{width:100%;padding:26rpx 26rpx calc(24rpx + env(safe-area-inset-bottom));border-radius:36rpx 36rpx 0 0;background:#f7fbfa}.notice-head{display:flex;align-items:flex-start;justify-content:space-between}.notice-head>view{display:flex;flex-direction:column;gap:7rpx}.notice-head>view text:first-child{font-size:32rpx;font-weight:800}.notice-head>view text:last-child{color:#718681;font-size:21rpx}.notice-head button{display:flex;width:88rpx;height:88rpx;align-items:center;justify-content:center;margin:0;padding:0;border-radius:24rpx;background:#e8efed}.notice-scroll{max-height:660rpx;margin-top:20rpx;padding:22rpx;box-sizing:border-box;border-radius:24rpx;background:#edf4f2}.notice-scroll>text{white-space:pre-wrap;color:#334e48;font-size:23rpx;line-height:1.75}.notice-rule{display:flex;justify-content:space-between;gap:18rpx;padding:19rpx 0;border-bottom:1rpx solid #dbe7e4;font-size:21rpx}.notice-rule:first-of-type{margin-top:20rpx;border-top:1rpx solid #dbe7e4}.notice-rule text:first-child{color:#718681}.notice-rule text:last-child{color:#29463f;text-align:right}.notice-confirm{height:88rpx;margin-top:20rpx;border-radius:25rpx;background:#0b8d84;color:#f4fbf9;font-size:27rpx;font-weight:780;line-height:88rpx}.empty{display:flex;align-items:center;flex-direction:column;padding:110rpx 36rpx;text-align:center}.empty-icon{display:flex;width:106rpx;height:106rpx;align-items:center;justify-content:center;border-radius:33rpx;background:#dfece8}.empty-title{margin-top:24rpx;font-size:29rpx;font-weight:760}.empty-note{max-width:28em;margin-top:11rpx;color:#748984;font-size:21rpx;line-height:1.6}
</style>

<style scoped>
.portrait-map{box-sizing:border-box;width:100%;max-width:630rpx;margin:12rpx auto 0}
.short-seats{display:grid;grid-template-columns:repeat(2,88rpx);justify-content:center;gap:12rpx}
.portrait-map .pool-middle{display:grid;grid-template-columns:88rpx minmax(0,1fr) 88rpx;align-items:stretch;gap:12rpx;margin:12rpx 0}
.long-seats{display:grid;grid-template-rows:repeat(9,88rpx);gap:9rpx}
.portrait-map .pool{min-height:864rpx}
.my-current>view{display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx}
.my-current>view text+text{color:#5b746e;font-size:19rpx;line-height:1.45}
</style>
