<template>
  <view class="page">
    <xy-header title="开通会员" />
    <view class="hero">
      <text class="hero-kicker">XY MEMBER</text>
      <text class="hero-title">成为会员，钓得更尽兴</text>
      <text class="hero-note">预约优先 · 商城折扣 · 到店专属权益</text>
    </view>

    <view class="content">
      <view class="section-head">
        <text class="section-title">选择会员方案</text>
        <text class="section-note">到期前均可享受对应权益</text>
      </view>

      <view v-if="plans.length" class="plan-list">
        <view v-for="plan in plans" :key="plan.planId" class="plan-card" :class="{ selected: selected && selected.planId === plan.planId }" @click="selected = plan">
          <view class="select-dot"><view class="select-inner" /></view>
          <view class="plan-copy">
            <view class="plan-row"><text class="plan-name">{{ plan.planName }}</text><text class="price"><text>¥</text>{{ plan.amount }}</text></view>
            <text class="plan-detail">有效期 {{ plan.durationDays }} 天 · 每日基础预约 {{ plan.dailyReservationLimit }} 个时段</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <uni-icons type="info" size="32" color="#8ba09c" />
        <text>暂无可购买会员方案</text>
      </view>

      <view class="rights-card">
        <text class="rights-title">会员权益</text>
        <view class="rights-grid">
          <view class="right-item"><view class="right-icon"><uni-icons type="calendar" size="22" color="#0a968b" /></view><text>优先预约</text></view>
          <view class="right-item"><view class="right-icon"><uni-icons type="cart" size="22" color="#0a968b" /></view><text>商城折扣</text></view>
          <view class="right-item"><view class="right-icon"><uni-icons type="vip" size="22" color="#0a968b" /></view><text>专属动态码</text></view>
        </view>
      </view>

      <view v-if="demoEnabled" class="demo-tip"><xy-icon name="info" :size="28" color="#0a8f84" /><text>当前为演示支付，不会产生真实扣款</text></view>
      <button class="pay" :disabled="!selected || paying" :loading="paying" @click="pay">
        {{ selected ? `${demoEnabled ? '演示支付' : '微信支付'} ¥${selected.amount}` : '请选择会员方案' }}
      </button>
      <text class="agreement">支付即表示同意会员服务规则</text>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, publicRequest, showRequestError } from '../../utils/api'

export default {
  data() {
    return { plans: [], selected: null, paying: false, demoEnabled: false }
  },
  onLoad() {
    this.load()
    this.loadPaymentMode()
  },
  methods: {
    async load() {
      try {
        this.plans = await publicRequest({ url: '/app/membership-plans' })
        this.selected = this.plans[0] || null
      } catch (error) {
        showRequestError(error)
      }
    },
    async loadPaymentMode() { try { const settings = await publicRequest({ url: '/app/payment-settings' }); this.demoEnabled = !!settings.demoEnabled } catch (error) {} },
    async pay() {
      if (!this.selected || this.paying) return
      this.paying = true
      try {
        await ensureMemberSession()
        const payment = await appRequest({ url: `/app/membership-payments/${this.selected.planId}`, method: 'POST' })
        if (payment.demoPayment) {
          uni.showToast({ title: '会员开通成功', icon: 'success' })
          setTimeout(() => uni.redirectTo({ url: '/pages/membership/card' }), 500)
          return
        }
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
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#f2f7f6;padding-bottom:50rpx}.hero{position:relative;overflow:hidden;padding:54rpx 36rpx 90rpx;background:linear-gradient(135deg,#075b59 0%,#0b8b83 55%,#18aea2 100%);color:#fff}.hero::after{content:'';position:absolute;right:-120rpx;bottom:-180rpx;width:390rpx;height:390rpx;border:70rpx solid rgba(255,255,255,.08);border-radius:50%}.hero-kicker,.hero-title,.hero-note{position:relative;z-index:1;display:block}.hero-kicker{font-size:21rpx;font-weight:700;letter-spacing:5rpx;opacity:.72}.hero-title{margin-top:20rpx;font-size:42rpx;font-weight:900}.hero-note{margin-top:14rpx;font-size:25rpx;opacity:.82}.content{position:relative;margin-top:-50rpx;padding:0 28rpx}.section-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20rpx;padding:0 4rpx}.section-title{font-size:31rpx;font-weight:800;color:#192724}.section-note{color:#84938f;font-size:21rpx}.plan-list{display:flex;flex-direction:column;gap:18rpx}.plan-card{display:flex;align-items:center;padding:30rpx 26rpx;border:3rpx solid transparent;border-radius:26rpx;background:#fff;box-shadow:0 12rpx 34rpx rgba(24,76,71,.05)}.plan-card.selected{border-color:#14aa9f;background:#fafffe}.select-dot{display:flex;align-items:center;justify-content:center;width:34rpx;height:34rpx;margin-right:22rpx;border:3rpx solid #c8d7d4;border-radius:50%}.selected .select-dot{border-color:#11a89c}.select-inner{width:18rpx;height:18rpx;border-radius:50%}.selected .select-inner{background:#11a89c}.plan-copy{flex:1}.plan-row{display:flex;align-items:baseline;justify-content:space-between}.plan-name{font-size:30rpx;font-weight:800;color:#1a2825}.price{color:#d56a3f;font-size:39rpx;font-weight:900}.price text{font-size:22rpx}.plan-detail{display:block;margin-top:12rpx;color:#71827e;font-size:23rpx}.rights-card{margin-top:22rpx;padding:28rpx;border-radius:26rpx;background:#fff}.rights-title{font-size:27rpx;font-weight:800;color:#253532}.rights-grid{display:grid;grid-template-columns:repeat(3,1fr);margin-top:24rpx}.right-item{display:flex;flex-direction:column;align-items:center;gap:12rpx;color:#596c68;font-size:23rpx}.right-icon{display:flex;align-items:center;justify-content:center;width:68rpx;height:68rpx;border-radius:22rpx;background:#e8f8f6}.demo-tip{display:flex;align-items:center;gap:12rpx;margin-top:22rpx;padding:19rpx 22rpx;border-radius:20rpx;background:#dcf1ed;color:#52716c;font-size:22rpx}button::after{border:0}.pay{height:90rpx;margin-top:20rpx;border-radius:24rpx;background:#10a89c;color:#fff;font-size:29rpx;font-weight:800;line-height:90rpx;box-shadow:0 14rpx 30rpx rgba(17,168,156,.2)}.pay[disabled]{background:#b9c9c6;color:#fff;box-shadow:none}.agreement{display:block;margin-top:18rpx;text-align:center;color:#93a19e;font-size:21rpx}.empty-state{display:flex;flex-direction:column;align-items:center;gap:18rpx;padding:90rpx;border-radius:26rpx;background:#fff;color:#82918e;font-size:24rpx}
</style>
