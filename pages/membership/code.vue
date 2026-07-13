<template>
  <view class="page">
    <xy-header title="会员动态码" />
    <view class="content">
      <view class="hero-copy">
        <text class="eyebrow">到店核验</text>
        <text class="title">向工作人员出示动态码</text>
        <text class="note">动态码会定时更新，请勿截图转发</text>
      </view>

      <view class="code-card">
        <view class="brand"><view class="brand-dot" /><text>钓虾生活馆会员</text></view>
        <text class="code">{{ code || '--------' }}</text>
        <view class="timer" :class="{ expired: remaining <= 0 }">
          <view class="pulse" />
          <text>{{ remaining > 0 ? `${remaining} 秒后自动失效` : '动态码已失效' }}</text>
        </view>
        <view class="divider" />
        <button class="refresh" :loading="loading" @click="refresh">刷新动态码</button>
      </view>

      <view class="tip-card">
        <uni-icons type="info" size="20" color="#0f9f94" />
        <text>完成到店签到后，会员当天可按规则续约有空位的场次。</text>
      </view>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return { code: '', remaining: 0, timer: null, loading: false }
  },
  onLoad() {
    this.refresh()
  },
  onUnload() {
    clearInterval(this.timer)
  },
  methods: {
    async refresh() {
      this.loading = true
      try {
        await ensureMemberSession()
        const data = await appRequest({ url: '/app/membership-code' })
        this.code = data.code
        this.remaining = data.expiresIn
        clearInterval(this.timer)
        this.timer = setInterval(() => {
          if (this.remaining > 0) this.remaining -= 1
          else clearInterval(this.timer)
        }, 1000)
      } catch (error) {
        showRequestError(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef6f4}.content{padding:40rpx 30rpx}.hero-copy{padding:6rpx 8rpx 34rpx}.eyebrow,.title,.note{display:block}.eyebrow{color:#0f9f94;font-size:23rpx;font-weight:700;letter-spacing:3rpx}.title{margin-top:14rpx;color:#152622;font-size:38rpx;font-weight:800}.note{margin-top:12rpx;color:#7a8c88;font-size:24rpx}.code-card{position:relative;overflow:hidden;padding:34rpx 32rpx 40rpx;border-radius:34rpx;background:#fff;box-shadow:0 22rpx 60rpx rgba(22,82,76,.09)}.code-card::before{content:'';position:absolute;top:-90rpx;right:-70rpx;width:250rpx;height:250rpx;border-radius:50%;background:rgba(17,168,156,.08)}.brand{position:relative;display:flex;align-items:center;gap:12rpx;color:#4d625e;font-size:24rpx}.brand-dot{width:18rpx;height:18rpx;border:6rpx solid #aee6df;border-radius:50%;background:#11a89c}.code{position:relative;display:block;margin:72rpx 0 26rpx;text-align:center;color:#0b8179;font-size:66rpx;font-weight:900;letter-spacing:12rpx}.timer{display:flex;align-items:center;justify-content:center;gap:12rpx;color:#67807c;font-size:23rpx}.timer.expired{color:#cf625c}.pulse{width:12rpx;height:12rpx;border-radius:50%;background:#23b5aa;box-shadow:0 0 0 8rpx rgba(35,181,170,.1)}.expired .pulse{background:#cf625c;box-shadow:0 0 0 8rpx rgba(207,98,92,.1)}.divider{height:1rpx;margin:52rpx 0 28rpx;background:linear-gradient(90deg,transparent,#d9e5e3,transparent)}button::after{border:0}.refresh{height:84rpx;border-radius:22rpx;background:#e6f8f5;color:#078d83;font-size:27rpx;font-weight:700;line-height:84rpx}.tip-card{display:flex;align-items:flex-start;gap:16rpx;margin-top:24rpx;padding:26rpx;border:1rpx solid rgba(17,168,156,.12);border-radius:24rpx;background:rgba(255,255,255,.72);color:#57706c;font-size:24rpx;line-height:1.6}.tip-card text{flex:1}
</style>
