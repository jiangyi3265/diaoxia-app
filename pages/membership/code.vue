<template>
  <view class="page">
    <xy-header title="会员动态码" />
    <view class="content">
      <view class="hero-copy">
        <text class="eyebrow">到店核验</text>
        <text class="title">向工作人员出示二维码</text>
        <text class="note">二维码每 10 秒自动更新，请当面扫码核验</text>
      </view>

      <view class="code-card">
        <view class="brand"><view class="brand-dot" /><text>钓虾生活馆会员</text></view>
        <view class="qr-stage">
          <canvas v-show="code" id="memberQr" canvas-id="memberQr" class="qr-canvas" />
          <view v-if="!code" class="qr-placeholder">
            <view class="loading-ring" />
            <text>{{ loading ? '正在生成二维码' : '二维码暂不可用' }}</text>
          </view>
          <view v-if="loading && code" class="qr-updating">
            <view class="loading-ring" />
            <text>正在更新</text>
          </view>
        </view>
        <view class="timer" :class="{ expired: remaining <= 0 }">
          <view class="pulse" />
          <text>{{ loading ? '正在获取新二维码' : `${remaining} 秒后自动更新` }}</text>
        </view>
        <view class="progress"><view class="progress-value" :style="{ width: progressWidth }" /></view>
        <view class="divider" />
        <button class="refresh" :disabled="loading" @click="refresh(false)">立即更新二维码</button>
      </view>

      <view class="tip-card">
        <uni-icons type="info" size="20" color="#0f9f94" />
        <text>完成到店签到后，会员当天可按规则续约有空位的场次。</text>
      </view>
    </view>
  </view>
</template>

<script>
import qrcode from 'qrcode-generator'
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() {
    return { code: '', remaining: 0, expiresAt: 0, timer: null, retryTimer: null, loading: false, active: false }
  },
  computed: {
    progressWidth() {
      return `${Math.max(0, Math.min(100, this.remaining * 10))}%`
    }
  },
  onShow() {
    this.active = true
    this.refresh(true)
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
    drawQr(value) {
      const qr = qrcode(0, 'M')
      qr.addData(value)
      qr.make()
      const modules = qr.getModuleCount()
      uni.createSelectorQuery().in(this).select('#memberQr').boundingClientRect((rect) => {
        if (!rect || this.code !== value) return
        const size = Math.floor(rect.width)
        const quietZone = Math.max(12, Math.floor(size * 0.065))
        const moduleSize = Math.floor((size - quietZone * 2) / modules)
        const qrSize = moduleSize * modules
        const offset = Math.floor((size - qrSize) / 2)
        const context = uni.createCanvasContext('memberQr', this)
        context.setFillStyle('#fbfefd')
        context.fillRect(0, 0, size, size)
        context.setFillStyle('#102d29')
        for (let row = 0; row < modules; row += 1) {
          for (let column = 0; column < modules; column += 1) {
            if (qr.isDark(row, column)) {
              context.fillRect(offset + column * moduleSize, offset + row * moduleSize, moduleSize, moduleSize)
            }
          }
        }
        context.draw()
      }).exec()
    },
    async refresh(silent = false) {
      if (this.loading || !this.active) return
      clearTimeout(this.retryTimer)
      this.loading = true
      try {
        await ensureMemberSession()
        const data = await appRequest({ url: '/app/membership-code' })
        this.code = data.code
        const expiresIn = Number(data.expiresIn) || 10
        await this.$nextTick()
        this.drawQr(this.code)
        this.startCountdown(data.expiresAt, expiresIn)
      } catch (error) {
        this.code = ''
        this.remaining = 0
        if (!silent) showRequestError(error)
        if (this.active) this.retryTimer = setTimeout(() => this.refresh(true), 2000)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#eef6f4}.content{padding:40rpx 30rpx}.hero-copy{padding:6rpx 8rpx 34rpx}.eyebrow,.title,.note{display:block}.eyebrow{color:#0f9f94;font-size:23rpx;font-weight:700;letter-spacing:3rpx}.title{margin-top:14rpx;color:#152622;font-size:38rpx;font-weight:800}.note{margin-top:12rpx;color:#71847f;font-size:24rpx}.code-card{position:relative;padding:32rpx 32rpx 38rpx;border:1rpx solid #dceae7;border-radius:34rpx;background:#fbfefd;box-shadow:0 22rpx 60rpx rgba(22,82,76,.08)}.brand{display:flex;align-items:center;justify-content:center;gap:12rpx;color:#4d625e;font-size:24rpx}.brand-dot{width:14rpx;height:14rpx;border:6rpx solid #bcebe5;border-radius:50%;background:#11a89c}.qr-stage{position:relative;width:430rpx;height:430rpx;margin:26rpx auto 20rpx;overflow:hidden;border:1rpx solid #d9e7e4;border-radius:28rpx;background:#fbfefd}.qr-canvas{width:430rpx;height:430rpx}.qr-placeholder,.qr-updating{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18rpx;color:#70847f;font-size:24rpx}.qr-updating{background:rgba(251,254,253,.9)}.loading-ring{width:42rpx;height:42rpx;border:6rpx solid #cde8e4;border-top-color:#0f9f94;border-radius:50%;animation:spin .8s linear infinite}.timer{display:flex;align-items:center;justify-content:center;gap:12rpx;color:#55736e;font-size:24rpx}.timer.expired{color:#c75d57}.pulse{width:12rpx;height:12rpx;border-radius:50%;background:#23b5aa;box-shadow:0 0 0 8rpx rgba(35,181,170,.1)}.expired .pulse{background:#c75d57;box-shadow:0 0 0 8rpx rgba(199,93,87,.1)}.progress{height:8rpx;margin:24rpx 44rpx 0;overflow:hidden;border-radius:999rpx;background:#e4efed}.progress-value{height:100%;border-radius:inherit;background:#13a79b;transition:width .25s linear}.divider{height:1rpx;margin:32rpx 0 26rpx;background:#e1ecea}button::after{border:0}.refresh{height:84rpx;border-radius:22rpx;background:#e2f5f2;color:#087f77;font-size:27rpx;font-weight:700;line-height:84rpx}.refresh[disabled]{background:#edf4f3;color:#91a4a0}.tip-card{display:flex;align-items:flex-start;gap:16rpx;margin-top:24rpx;padding:26rpx;border:1rpx solid rgba(17,168,156,.12);border-radius:24rpx;background:rgba(251,254,253,.76);color:#57706c;font-size:24rpx;line-height:1.6}.tip-card text{flex:1}@keyframes spin{to{transform:rotate(360deg)}}
</style>
