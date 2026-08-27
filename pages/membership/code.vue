<template>
  <view class="page">
    <xy-header title="会员动态码" />
    <view class="content">
      <view class="hero-copy">
        <text class="eyebrow">到店核验</text>
        <text class="title">向工作人员出示 4 位会员码</text>
        <text class="note">会员码每 10 秒自动更新，请由工作人员当面录入</text>
      </view>

      <view class="code-card">
        <view class="brand"><view class="brand-dot" /><text>成泰钓虾俱乐部会员</text></view>
        <view class="number-stage">
          <view v-if="code" class="member-number">
            <text v-for="(digit, index) in codeDigits" :key="index">{{ digit }}</text>
          </view>
          <view v-else class="code-placeholder">
            <view class="loading-ring" />
            <text>{{ loading ? '正在生成会员码' : '会员码暂不可用' }}</text>
          </view>
          <view v-if="loading && code" class="code-updating">
            <view class="loading-ring" />
            <text>正在更新</text>
          </view>
        </view>
        <view class="timer" :class="{ expired: remaining <= 0 }">
          <view class="pulse" />
          <text>{{ loading ? '正在获取新会员码' : `${remaining} 秒后自动更新` }}</text>
        </view>
        <view class="progress"><view class="progress-value" :style="{ width: progressWidth }" /></view>
        <view class="divider" />
        <button class="refresh" :disabled="loading" @click="refresh(false)">立即更新会员码</button>
      </view>

      <view class="tip-card">
        <xy-icon name="info" :size="36" color="#0f9f94" />
        <text>工作人员在后台输入此码后，会员身份和今日待签到预约会一并核验。</text>
      </view>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return { code: '', remaining: 0, expiresAt: 0, timer: null, retryTimer: null, loading: false, active: false }
  },
  computed: {
    codeDigits() { return String(this.code || '').padStart(4, '–').slice(0, 4).split('') },
    progressWidth() {
      return `${Math.max(0, Math.min(100, this.remaining * 10))}%`
    }
  },
  onShow() {
    this.active = true
    this.refresh(false)
  },
  onHide() {
    this.active = false
    this.stopTimers()
  },
  onUnload() {
    this.active = false
    this.stopTimers()
  },
  methods: {
    stopTimers() {
      clearInterval(this.timer)
      clearTimeout(this.retryTimer)
      this.timer = null
      this.retryTimer = null
    },
    startCountdown(expiresAt, expiresIn) {
      clearInterval(this.timer)
      this.expiresAt = Number(expiresAt) || Date.now() + expiresIn * 1000
      const tick = () => {
        this.remaining = Math.max(0, Math.ceil((this.expiresAt - Date.now()) / 1000))
        if (this.remaining <= 0) {
          clearInterval(this.timer)
          this.timer = null
          if (this.active) this.refresh(true)
        }
      }
      tick()
      this.timer = setInterval(tick, 250)
    },
    async refresh(silent = false) {
      if (this.loading || !this.active) return
      clearTimeout(this.retryTimer)
      this.loading = true
      try {
        await ensureMemberSession()
        const data = await appRequest({ url: '/app/membership-code' })
        const code = String(data.code || '')
        if (!/^\d{4}$/.test(code)) throw new Error('会员码格式不正确，请重试')
        this.code = code
        const expiresIn = Number(data.expiresIn) || 10
        this.startCountdown(data.expiresAt, expiresIn)
      } catch (error) {
        this.code = ''
        this.remaining = 0
        if (!silent || (error && error.code)) showRequestError(error)
        if (this.active && (!error || !error.code)) this.retryTimer = setTimeout(() => this.refresh(true), 2000)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef6f4}.content{padding:40rpx 30rpx}.hero-copy{padding:6rpx 8rpx 34rpx}.eyebrow,.title,.note{display:block}.eyebrow{color:#0f9f94;font-size:23rpx;font-weight:700;letter-spacing:3rpx}.title{margin-top:14rpx;color:#152622;font-size:38rpx;font-weight:800}.note{margin-top:12rpx;color:#71847f;font-size:24rpx;line-height:1.55}.code-card{position:relative;padding:32rpx 32rpx 38rpx;border:1rpx solid #dceae7;border-radius:34rpx;background:#fbfefd;box-shadow:0 22rpx 60rpx rgba(22,82,76,.08)}.brand{display:flex;align-items:center;justify-content:center;gap:12rpx;color:#4d625e;font-size:24rpx}.brand-dot{width:14rpx;height:14rpx;border:6rpx solid #bcebe5;border-radius:50%;background:#11a89c}.number-stage{position:relative;display:flex;width:100%;height:300rpx;align-items:center;justify-content:center;margin:26rpx auto 20rpx;overflow:hidden;border:1rpx solid #d9e7e4;border-radius:28rpx;background:linear-gradient(145deg,#f5fbf9,#eaf6f3)}.member-number{display:grid;width:100%;grid-template-columns:repeat(4,1fr);gap:16rpx;padding:0 24rpx}.member-number text{display:flex;height:132rpx;align-items:center;justify-content:center;border:1rpx solid #cce4df;border-radius:24rpx;background:#fbfefd;color:#123c36;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:76rpx;font-weight:850;line-height:1;box-shadow:0 10rpx 28rpx rgba(16,91,82,.08)}.code-placeholder,.code-updating{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18rpx;color:#70847f;font-size:24rpx}.code-updating{background:rgba(245,251,249,.92)}.loading-ring{width:42rpx;height:42rpx;border:6rpx solid #cde8e4;border-top-color:#0f9f94;border-radius:50%;animation:spin .8s linear infinite}.timer{display:flex;align-items:center;justify-content:center;gap:12rpx;color:#55736e;font-size:24rpx}.timer.expired{color:#c75d57}.pulse{width:12rpx;height:12rpx;border-radius:50%;background:#23b5aa;box-shadow:0 0 0 8rpx rgba(35,181,170,.1)}.expired .pulse{background:#c75d57;box-shadow:0 0 0 8rpx rgba(199,93,87,.1)}.progress{height:8rpx;margin:24rpx 44rpx 0;overflow:hidden;border-radius:999rpx;background:#e4efed}.progress-value{height:100%;border-radius:inherit;background:#13a79b;transition:width .25s linear}.divider{height:1rpx;margin:32rpx 0 26rpx;background:#e1ecea}button::after{border:0}.refresh{height:84rpx;border-radius:22rpx;background:#e2f5f2;color:#087f77;font-size:27rpx;font-weight:700;line-height:84rpx}.refresh[disabled]{background:#edf4f3;color:#91a4a0}.tip-card{display:flex;align-items:flex-start;gap:16rpx;margin-top:24rpx;padding:26rpx;border:1rpx solid rgba(17,168,156,.12);border-radius:24rpx;background:rgba(251,254,253,.76);color:#57706c;font-size:24rpx;line-height:1.6}.tip-card text{flex:1}@keyframes spin{to{transform:rotate(360deg)}}
</style>
