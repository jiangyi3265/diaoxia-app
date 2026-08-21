<template>
  <view class="page">
    <xy-header title="开通会员" />
    <view class="hero">
      <text class="hero-kicker">XY MEMBER</text>
      <text class="hero-title">成为会员，钓得更尽兴</text>
      <text class="hero-note">预约钓虾 · 商城折扣 · 到店专属权益</text>
    </view>

    <view class="content">
      <view class="section-head">
        <text class="section-title">钓虾包月会员</text>
        <text class="section-note">连续 30 天有效</text>
      </view>

      <xy-state v-if="loadingPlans" type="loading" />
      <xy-state
        v-else-if="plansError"
        type="error"
        title="会员方案加载失败"
        :description="plansError"
        action-text="重新加载"
        @action="load"
      />
      <view v-else-if="selected" class="plan-list">
        <view class="plan-card selected">
          <view class="plan-copy">
            <view class="plan-row"><text class="plan-name">{{ selected.planName }}</text><text class="price"><text>¥</text>{{ selected.amount }}</text></view>
            <text class="plan-detail">开通后连续 {{ selected.durationDays }} 天享受会员权益</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <xy-icon name="info" :size="58" color="#8ba09c" />
        <text>暂无可购买会员方案</text>
      </view>

      <block v-if="!loadingPlans && !plansError">
      <view class="rights-card">
        <text class="rights-title">会员权益</text>
        <view class="rights-grid">
          <view class="right-item"><view class="right-icon"><xy-icon name="calendar-check" :size="38" color="#0a968b" /></view><text>预约钓虾</text></view>
          <view class="right-item"><view class="right-icon"><xy-icon name="cart" :size="38" color="#0a968b" /></view><text>商城折扣</text></view>
          <view class="right-item"><view class="right-icon"><xy-icon name="qrcode" :size="38" color="#0a968b" /></view><text>专属动态码</text></view>
        </view>
      </view>

      <view class="payment-tip" :class="paymentMode.toLowerCase()">
        <xy-icon name="info" :size="30" color="#0a8f84" />
        <view><text>{{ paymentTitle }}</text><text>{{ paymentDescription }}</text></view>
      </view>
      <button class="pay" :disabled="!selected || paying || applicationSubmitted" :loading="paying" @click="pay">
        {{ payButtonText }}
      </button>
      <text class="agreement">提交即表示你已阅读并同意<text class="agreement-link" @click="openTerms">《用户服务协议》</text></text>
      </block>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, publicRequest, showRequestError } from '../../utils/api'

export default {
  data() {
    return { plans: [], selected: null, paying: false, loadingPlans: true, plansError: '', paymentMode: 'OFFLINE', applicationSubmitted: false }
  },
  onLoad() {
    this.load()
    this.loadPaymentMode()
  },
  methods: {
    async load() {
      this.loadingPlans = true
      this.plansError = ''
      try {
        const plans = await publicRequest({ url: '/app/membership-plans' })
        this.plans = plans.filter((plan) => Number(plan.durationDays) === 30).slice(0, 1)
        this.selected = this.plans[0] || null
      } catch (error) {
        this.selected = null
        this.plansError = (error && error.message) || '暂时无法读取会员方案，请稍后重试'
      } finally { this.loadingPlans = false }
    },
    async loadPaymentMode() {
      try {
        const settings = await publicRequest({ url: '/app/payment-settings' })
        this.paymentMode = String(settings.mode || (settings.demoEnabled ? 'DEMO' : settings.wechatPayEnabled ? 'WECHAT' : 'OFFLINE')).toUpperCase()
      } catch (error) { this.paymentMode = 'OFFLINE' }
    },
    async pay() {
      if (!this.selected || this.paying) return
      this.paying = true
      try {
        await ensureMemberSession()
        const payment = await appRequest({ url: `/app/membership-payments/${this.selected.planId}`, method: 'POST' })
        if (payment.offlinePayment || payment.pendingConfirmation) {
          this.applicationSubmitted = true
          uni.showModal({
            title: '开卡申请已提交',
            content: `${payment.expireTime ? `请在 ${String(payment.expireTime).replace('T', ' ').slice(0, 16)} 前` : '请在 24 小时内'}到门店完成付款，逾期申请会自动关闭。工作人员确认收款后，会员权益会自动生效。`,
            showCancel: false,
            confirmText: '查看记录',
            confirmColor: '#0B756E',
            success: () => uni.redirectTo({ url: '/pages/bills/bills' })
          })
          return
        }
        if (payment.demoPayment && this.paymentMode === 'DEMO') {
          uni.showToast({ title: '会员开通成功', icon: 'success' })
          setTimeout(() => uni.redirectTo({ url: '/pages/membership/card' }), 500)
          return
        }
        if (this.paymentMode !== 'WECHAT') throw new Error('当前暂不支持微信支付，请到店办理')
        uni.requestPayment({
          ...payment,
          success: () => uni.redirectTo({ url: '/pages/membership/card' }),
          fail: () => uni.showToast({ title: '支付未完成', icon: 'none' })
        })
      } catch (error) {
        showRequestError(error)
      } finally {
        this.paying = false
      }
    },
    openTerms() {
      uni.navigateTo({ url: '/pages/legal/terms' })
    }
  },
  computed: {
    paymentTitle() { return this.paymentMode === 'OFFLINE' ? '到店付款，确认后生效' : this.paymentMode === 'DEMO' ? '演示支付模式' : '微信安全支付' },
    paymentDescription() { return this.paymentMode === 'OFFLINE' ? '线上提交开卡申请，不会自动扣款；请在 24 小时内到店付款，逾期自动关闭' : this.paymentMode === 'DEMO' ? '仅用于测试，不会产生真实扣款' : '付款完成后会员权益即时生效' },
    payButtonText() {
      if (!this.selected) return '暂无可办理方案'
      if (this.applicationSubmitted) return '申请已提交，等待门店确认'
      if (this.paying) return '正在提交'
      if (this.paymentMode === 'OFFLINE') return `提交到店开卡申请 · ¥${this.selected.amount}`
      return `${this.paymentMode === 'DEMO' ? '演示支付' : '微信支付'} · ¥${this.selected.amount}`
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#f2f7f6;padding-bottom:50rpx}.hero{position:relative;overflow:hidden;padding:54rpx 36rpx 90rpx;background:linear-gradient(135deg,#075b59 0%,#0b8b83 55%,#18aea2 100%);color:#fff}.hero::after{content:'';position:absolute;right:-120rpx;bottom:-180rpx;width:390rpx;height:390rpx;border:70rpx solid rgba(255,255,255,.08);border-radius:50%}.hero-kicker,.hero-title,.hero-note{position:relative;z-index:1;display:block}.hero-kicker{font-size:21rpx;font-weight:700;letter-spacing:5rpx;opacity:.72}.hero-title{margin-top:20rpx;font-size:42rpx;font-weight:900}.hero-note{margin-top:14rpx;font-size:25rpx;opacity:.82}.content{position:relative;margin-top:-50rpx;padding:0 28rpx}.section-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20rpx;padding:0 4rpx}.section-title{font-size:31rpx;font-weight:800;color:#192724}.section-note{color:#84938f;font-size:21rpx}.plan-list{display:flex;flex-direction:column;gap:18rpx}.plan-card{display:flex;align-items:center;padding:30rpx 26rpx;border:3rpx solid transparent;border-radius:26rpx;background:#fff;box-shadow:0 12rpx 34rpx rgba(24,76,71,.05)}.plan-card.selected{border-color:#14aa9f;background:#fafffe}.select-dot{display:flex;align-items:center;justify-content:center;width:34rpx;height:34rpx;margin-right:22rpx;border:3rpx solid #c8d7d4;border-radius:50%}.selected .select-dot{border-color:#11a89c}.select-inner{width:18rpx;height:18rpx;border-radius:50%}.selected .select-inner{background:#11a89c}.plan-copy{flex:1}.plan-row{display:flex;align-items:baseline;justify-content:space-between}.plan-name{font-size:30rpx;font-weight:800;color:#1a2825}.price{color:#d56a3f;font-size:39rpx;font-weight:900}.price text{font-size:22rpx}.plan-detail{display:block;margin-top:12rpx;color:#71827e;font-size:23rpx}.rights-card{margin-top:22rpx;padding:28rpx;border-radius:26rpx;background:#fff}.rights-title{font-size:27rpx;font-weight:800;color:#253532}.rights-grid{display:grid;grid-template-columns:repeat(3,1fr);margin-top:24rpx}.right-item{display:flex;flex-direction:column;align-items:center;gap:12rpx;color:#596c68;font-size:23rpx}.right-icon{display:flex;align-items:center;justify-content:center;width:68rpx;height:68rpx;border-radius:22rpx;background:#e8f8f6}.payment-tip{display:flex;align-items:flex-start;gap:14rpx;margin-top:22rpx;padding:21rpx 22rpx;border:1rpx solid #cfe7e2;border-radius:22rpx;background:#e6f4f1}.payment-tip>view{display:flex;flex:1;flex-direction:column;gap:6rpx}.payment-tip text:first-child{color:#1f5048;font-size:24rpx;font-weight:750}.payment-tip text:last-child{color:#5b7771;font-size:21rpx;line-height:1.5}.payment-tip.demo{background:#f7f0df;border-color:#ebddbd}.payment-tip.wechat{background:#e4f4ec;border-color:#cce6d6}button::after{border:0}.pay{height:90rpx;margin-top:20rpx;border-radius:24rpx;background:#10a89c;color:#fff;font-size:29rpx;font-weight:800;line-height:90rpx;box-shadow:0 14rpx 30rpx rgba(17,168,156,.2)}.pay[disabled]{background:#b9c9c6;color:#fff;box-shadow:none}.agreement{display:block;margin-top:18rpx;text-align:center;color:#93a19e;font-size:21rpx}.agreement-link{color:#0b756e}.empty-state{display:flex;flex-direction:column;align-items:center;gap:18rpx;padding:90rpx;border-radius:26rpx;background:#fff;color:#82918e;font-size:24rpx}
</style>
