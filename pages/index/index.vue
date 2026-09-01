<template>
  <view class="page">
    <xy-header title="成泰钓虾俱乐部" variant="brand" :show-back="false" />

    <view class="content">
      <xy-state
        v-if="error"
        type="error"
        title="首页信息加载失败"
        :description="error"
        action-text="重新加载"
        @action="load"
      />
      <view v-else class="hero">
        <view class="hero-top">
          <view class="member-state">
            <view class="state-dot" :class="{ active: authenticated && hasCard }"></view>
            <text>{{ loading ? '正在加载服务信息' : heroState }}</text>
          </view>
          <view class="fish-mark">
            <xy-icon name="fish" :size="50" color="#DDF8F1" :weight="1.6" />
          </view>
        </view>

        <view class="hero-copy">
          <text class="hero-title">{{ heroTitle }}</text>
          <text class="hero-subtitle">{{ heroSubtitle }}</text>
        </view>

        <button class="hero-action" @click="go(primaryUrl)">
          <view class="action-copy">
            <text class="action-label">{{ primaryActionLabel }}</text>
            <text class="action-hint">{{ primaryActionHint }}</text>
          </view>
          <view class="action-arrow">
            <xy-icon name="arrow-up-right" :size="38" color="#0B756E" :weight="2" />
          </view>
        </button>
      </view>

      <view v-if="!authenticated" class="guest-entry">
        <view><text>游客浏览</text><text>无需登录即可查看门店、实时空位和会员方案</text></view>
        <button @click="openLogin('index')">登录</button>
      </view>

      <view class="section-head">
        <text class="section-title">常用服务</text>
        <text class="section-note">快速直达</text>
      </view>

      <view class="reservation-entry" @click="go('/pages/reserve/history', true)">
        <view class="reservation-icon">
          <xy-icon name="calendar-check" :size="48" color="#0B756E" :weight="1.8" />
        </view>
        <view class="reservation-copy">
          <text class="entry-title">我的预约</text>
          <text class="entry-subtitle">查看场次、座位与门店信息</text>
        </view>
        <xy-icon name="chevron-right" :size="34" color="#7D918C" :weight="1.8" />
      </view>

      <view class="benefit-entry" @click="go('/pages/benefit/benefit')">
        <view class="benefit-entry-icon"><xy-icon name="medal" :size="48" color="#A26322" :weight="1.8" /></view>
        <view class="reservation-copy"><text class="entry-title">福利钓专场</text><text class="entry-subtitle">20:15开场 · 22座池型选位</text></view>
        <view class="benefit-entry-action"><text>查看场次</text><xy-icon name="chevron-right" :size="30" color="#8A5A27" :weight="1.8" /></view>
      </view>

      <view class="service-grid">
        <view v-for="item in services" :key="item.url" class="service-item" @click="go(item.url, item.requiresAuth)">
          <view class="service-icon" :class="item.tone">
            <xy-icon :name="item.icon" :size="42" :color="item.color" :weight="1.8" />
          </view>
          <text class="service-title">{{ item.label }}</text>
          <text class="service-subtitle">{{ item.description }}</text>
        </view>
      </view>

      <view class="section-head secondary-head">
        <text class="section-title">更多</text>
      </view>

      <view class="more-list">
        <view v-for="(item, index) in moreEntries" :key="item.url" class="more-row" @click="go(item.url, item.requiresAuth)">
          <view class="more-icon">
            <xy-icon :name="item.icon" :size="38" color="#3D5752" :weight="1.7" />
          </view>
          <view class="more-copy">
            <text class="more-title">{{ item.label }}</text>
            <text class="more-subtitle">{{ item.description }}</text>
          </view>
          <xy-icon name="chevron-right" :size="32" color="#91A39F" :weight="1.7" />
          <view v-if="index < moreEntries.length - 1" class="row-divider"></view>
        </view>
      </view>
    </view>

    <view class="xy-tabbar-hold"></view>
    <xy-tabbar active="index" />
  </view>
</template>

<script>
import { appRequest, clearMemberSession, hasMemberSession, hasPrivacyConsent, publicRequest } from '../../utils/api'

export default {
  data() {
    return {
      me: {},
      authenticated: false,
      currentStore: null,
      monthlyPlan: null,
      loading: true,
      error: '',
      services: [
        { label: '会员方案', description: '查看权益、价格和办理方式', icon: 'card', url: '/pages/membership/join', tone: 'mint', color: '#0B756E', requiresAuth: false },
        { label: '门店服务', description: '营业时间、地址和导航', icon: 'location', url: '/pages/store/store', tone: 'sand', color: '#32778C', requiresAuth: false }
      ],
      moreEntries: [
        { label: '联系客服', description: '预约、会员与到店问题', icon: 'headset', url: '/pages/service/contact', requiresAuth: false },
        { label: '用户服务协议', description: '了解平台服务规则', icon: 'invoice', url: '/pages/legal/terms', requiresAuth: false }
      ]
    }
  },
  computed: {
    hasCard() {
      if (!this.authenticated) return false
      const card = this.me.card
      if (!card) return false
      const status = String(card.status || card.cardStatus || '').toUpperCase()
      if (status && !['ACTIVE', 'VALID', 'ENABLED'].includes(status)) return false
      if (card.expireDate) {
        const expiresAt = new Date(`${String(card.expireDate).slice(0, 10)}T23:59:59`)
        if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) return false
      }
      return true
    },
    primaryUrl() {
      return !this.authenticated || this.hasCard ? '/pages/reserve/reserve' : '/pages/membership/join'
    },
    heroState() {
      if (!this.authenticated) return '当前可直接浏览'
      if (!this.hasCard) return '尚未开通会员'
      return this.me.card.planName || '有效会员'
    },
    heroTitle() {
      if (!this.authenticated) return '先看看场次，再决定'
      return this.hasCard ? '今天，想坐哪一席？' : '轻松预约，尽兴开钓'
    },
    heroSubtitle() {
      if (this.loading) return '正在加载门店与预约信息'
      if (!this.authenticated) return this.currentStore ? `${this.currentStore.storeName} · ${this.currentStore.businessHours || '营业时间待更新'}` : '可浏览门店、实时空位与会员方案'
      if (this.hasCard) return `会员有效至 ${this.me.card.expireDate}`
      return this.monthlyPlan ? `月享会员 ¥${Number(this.monthlyPlan.amount).toFixed(2)}` : '线上提交申请，付款后开通'
    },
    primaryActionLabel() {
      if (!this.authenticated || this.hasCard) return '浏览实时空位'
      return '了解会员方案'
    },
    primaryActionHint() {
      if (!this.authenticated) return '无需登录，查看时段与剩余座位'
      if (this.hasCard) return '选择时段和心仪座位'
      return '查看权益，确认办理时再登录'
    }
  },
  onShow() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        const [stores, plans] = await Promise.all([
          publicRequest({ url: '/app/stores' }),
          publicRequest({ url: '/app/membership-plans' }).catch(() => [])
        ])
        this.currentStore = stores[0] || null
        this.monthlyPlan = plans.find(plan => Number(plan.durationDays) === 30) || plans[0] || null
        if (hasMemberSession() && hasPrivacyConsent()) {
          try {
            this.me = await appRequest({ url: '/app/me', redirectOnUnauthorized: false })
            this.authenticated = true
          } catch (error) {
            clearMemberSession()
            this.me = {}
            this.authenticated = false
          }
        } else {
          this.me = {}
          this.authenticated = false
        }
      } catch (error) {
        this.error = (error && error.message) || '暂时无法加载门店信息，请检查网络后重试'
      } finally {
        this.loading = false
      }
    },
    openLogin(redirect = 'index') {
      uni.navigateTo({ url: `/pages/login/login?redirect=${redirect}` })
    },
    go(url, requiresAuth = false) {
      if (requiresAuth && !this.authenticated) {
        const redirectMap = {
          '/pages/reserve/history': 'history',
          '/pages/membership/card': 'card'
        }
        this.openLogin(redirectMap[url] || 'index')
        return
      }
      if (url === '/pages/reserve/reserve' || url === '/pages/store/store') {
        uni.reLaunch({ url })
      } else {
        uni.navigateTo({ url })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #EDF5F3;
}

.content {
  padding: 24rpx 24rpx 12rpx;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 28rpx;
  border-radius: 34rpx;
  background: #0B756E;
  box-shadow: 0 18rpx 42rpx rgba(11, 92, 86, 0.18);
}

.hero::after {
  content: '';
  position: absolute;
  right: -96rpx;
  top: -86rpx;
  width: 280rpx;
  height: 280rpx;
  border: 2rpx solid rgba(221, 248, 241, 0.12);
  border-radius: 50%;
  pointer-events: none;
}

.hero-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-state {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  min-height: 48rpx;
  padding: 0 18rpx;
  border: 1rpx solid rgba(226, 249, 243, 0.2);
  border-radius: 24rpx;
  color: #DDF8F1;
  background: rgba(235, 253, 248, 0.1);
  font-size: 22rpx;
  font-weight: 600;
}

.state-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #B6C7C3;
}

.state-dot.active {
  background: #75E0B9;
  box-shadow: 0 0 0 6rpx rgba(117, 224, 185, 0.12);
}

.fish-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 24rpx;
  background: rgba(235, 253, 248, 0.12);
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin: 34rpx 0 30rpx;
}

.hero-title {
  color: #F3FCF9;
  font-size: 42rpx;
  font-weight: 750;
  letter-spacing: -0.6rpx;
}

.hero-subtitle {
  color: #BFE3DC;
  font-size: 24rpx;
}

.hero-action {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 100rpx;
  padding: 18rpx 18rpx 18rpx 24rpx;
  border-radius: 26rpx;
  color: #163C37;
  background: #F1FBF7;
  text-align: left;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out;
}

.hero-action:active,
.guest-entry button:active,
.reservation-entry:active,
.service-item:active,
.more-row:active {
  transform: scale(0.985);
  opacity: 0.9;
}

.guest-entry {
  display: flex;
  align-items: center;
  gap: 22rpx;
  min-height: 102rpx;
  margin: 18rpx 4rpx 0;
  padding: 16rpx 18rpx 16rpx 22rpx;
  border: 1rpx solid #D7E7E2;
  border-radius: 24rpx;
  background: #F7FBFA;
}

.guest-entry > view {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 6rpx;
}

.guest-entry > view text:first-child {
  color: #21413A;
  font-size: 24rpx;
  font-weight: 700;
}

.guest-entry > view text:last-child {
  color: #748984;
  font-size: 20rpx;
  line-height: 1.45;
}

.guest-entry button {
  flex: 0 0 112rpx;
  height: 64rpx;
  border-radius: 19rpx;
  background: #DCEFE9;
  color: #0B756E;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 64rpx;
}

.action-copy {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.action-label {
  font-size: 29rpx;
  font-weight: 700;
}

.action-hint {
  color: #58706B;
  font-size: 21rpx;
}

.action-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 22rpx;
  background: #DCEFE9;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 38rpx 6rpx 18rpx;
}

.section-title {
  color: #18322E;
  font-size: 31rpx;
  font-weight: 700;
}

.section-note {
  color: #7B918C;
  font-size: 22rpx;
}

.reservation-entry {
  display: flex;
  align-items: center;
  min-height: 124rpx;
  padding: 22rpx 24rpx;
  border: 1rpx solid #DCE9E5;
  border-radius: 28rpx;
  background: #F8FCFA;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out;
}

.benefit-entry {
  display: flex;
  align-items: center;
  min-height: 124rpx;
  margin-top: 18rpx;
  padding: 22rpx 24rpx;
  border: 1rpx solid #E8D7BC;
  border-radius: 28rpx;
  background: #FBF6EC;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out;
}

.benefit-entry:active { transform: scale(0.985); opacity: 0.9; }
.benefit-entry-icon { display:flex;align-items:center;justify-content:center;width:82rpx;height:82rpx;margin-right:20rpx;border-radius:25rpx;background:#F1E4CC; }
.benefit-entry-action { display:flex;align-items:center;gap:3rpx;color:#8A5A27;font-size:20rpx;font-weight:700; }

.reservation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82rpx;
  height: 82rpx;
  margin-right: 20rpx;
  border-radius: 25rpx;
  background: #DCEFE9;
}

.reservation-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.entry-title,
.service-title,
.more-title {
  color: #19332E;
  font-size: 28rpx;
  font-weight: 700;
}

.entry-subtitle,
.service-subtitle,
.more-subtitle {
  color: #748984;
  font-size: 22rpx;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 18rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  min-height: 198rpx;
  padding: 24rpx;
  border: 1rpx solid #DCE9E5;
  border-radius: 28rpx;
  background: #F8FCFA;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out;
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 24rpx;
  border-radius: 22rpx;
}

.service-icon.mint {
  background: #DDF1EB;
}

.service-icon.sand {
  background: #F4E9D8;
}

.service-subtitle {
  margin-top: 8rpx;
  line-height: 1.45;
}

.secondary-head {
  margin-top: 34rpx;
}

.more-list {
  overflow: hidden;
  border: 1rpx solid #DCE9E5;
  border-radius: 28rpx;
  background: #F8FCFA;
}

.more-row {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 108rpx;
  padding: 18rpx 24rpx;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out;
}

.more-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  margin-right: 18rpx;
  border-radius: 21rpx;
  background: #EDF3F1;
}

.more-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
}

.more-title {
  font-size: 26rpx;
}

.row-divider {
  position: absolute;
  right: 24rpx;
  bottom: 0;
  left: 110rpx;
  height: 1rpx;
  background: #E4ECE9;
}
</style>
