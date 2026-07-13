<template>
  <view class="page">
    <xy-header title="钓虾生活馆" variant="brand" :show-back="false" />

    <view class="content">
      <view class="hero">
        <view class="hero-top">
          <view class="member-state">
            <view class="state-dot" :class="{ active: hasCard }"></view>
            <text>{{ loading ? '正在确认会员状态' : memberState }}</text>
          </view>
          <view class="fish-mark">
            <xy-icon name="fish" :size="50" color="#DDF8F1" :weight="1.6" />
          </view>
        </view>

        <view class="hero-copy">
          <text class="hero-title">{{ hasCard ? '今天，想坐哪一席？' : '轻松预约，尽兴开钓' }}</text>
          <text class="hero-subtitle">{{ heroSubtitle }}</text>
        </view>

        <button class="hero-action" @click="go(primaryUrl)">
          <view class="action-copy">
            <text class="action-label">{{ hasCard ? '立即预约座位' : '开通会员' }}</text>
            <text class="action-hint">{{ hasCard ? '选择时段和心仪座位' : '解锁在线选座与会员优惠' }}</text>
          </view>
          <view class="action-arrow">
            <xy-icon name="arrow-up-right" :size="38" color="#0B756E" :weight="2" />
          </view>
        </button>
      </view>

      <view class="section-head">
        <text class="section-title">常用服务</text>
        <text class="section-note">快速直达</text>
      </view>

      <view class="reservation-entry" @click="go('/pages/reserve/history')">
        <view class="reservation-icon">
          <xy-icon name="calendar-check" :size="48" color="#0B756E" :weight="1.8" />
        </view>
        <view class="reservation-copy">
          <text class="entry-title">我的预约</text>
          <text class="entry-subtitle">查看场次、座位与签到码</text>
        </view>
        <xy-icon name="chevron-right" :size="34" color="#7D918C" :weight="1.8" />
      </view>

      <view class="service-grid">
        <view v-for="item in services" :key="item.url" class="service-item" @click="go(item.url)">
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
        <view v-for="(item, index) in moreEntries" :key="item.url" class="more-row" @click="go(item.url)">
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
import { appRequest, ensureMemberSession } from '../../utils/api'

export default {
  data() {
    return {
      me: {},
      loading: true,
      services: [
        { label: '商城', description: '钓具与到店好物', icon: 'bag', url: '/pages/mall/mall', tone: 'mint', color: '#0B756E' },
        { label: '我的订单', description: '配送、收货与售后', icon: 'invoice', url: '/pages/order/list', tone: 'sand', color: '#9A672B' }
      ],
      moreEntries: [
        { label: '会员卡', description: '查看权益与有效期', icon: 'card', url: '/pages/membership/card' },
        { label: '门店信息', description: '地址、营业时间与导航', icon: 'location', url: '/pages/store/store' }
      ]
    }
  },
  computed: {
    hasCard() {
      return !!this.me.card
    },
    primaryUrl() {
      return this.hasCard ? '/pages/reserve/reserve' : '/pages/membership/join'
    },
    memberState() {
      if (!this.hasCard) return '尚未开通会员'
      return this.me.card.planName || '有效会员'
    },
    heroSubtitle() {
      if (this.loading) return '正在加载你的专属服务'
      if (this.hasCard) return `会员有效至 ${this.me.card.expireDate}`
      return '开通后即可在线选时段、挑座位'
    }
  },
  onShow() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        await ensureMemberSession()
        this.me = await appRequest({ url: '/app/me' })
      } catch (error) {
        this.me = {}
      } finally {
        this.loading = false
      }
    },
    go(url) {
      if (url === '/pages/reserve/reserve' || url === '/pages/mall/mall') {
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
.reservation-entry:active,
.service-item:active,
.more-row:active {
  transform: scale(0.985);
  opacity: 0.9;
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
