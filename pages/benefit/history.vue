<template>
  <view class="page">
    <xy-header title="我的福利钓" />
    <view class="wrap">
      <xy-state v-if="loading" type="loading" />
      <xy-state v-else-if="error" type="error" title="报名记录加载失败" :description="error" action-text="重新加载" @action="load" />
      <view v-else-if="records.length" class="records">
        <view v-for="item in records" :key="item.bookingNo" class="record">
          <view class="record-top"><view><text>{{ formatDate(item.eventDate) }}</text><text>{{ item.startTime }}–{{ item.endTime }}</text></view><text class="status" :class="statusClass(item.displayStatus)">{{ item.displayStatus }}</text></view>
          <view class="record-main"><view class="seat"><text>{{ item.seatNo }}</text><text>座位</text></view><view class="info"><text>{{ item.storeName }}</text><text>{{ item.address }}</text><text>报名费 ¥{{ money(item.feeAmount) }} · 编号 {{ item.bookingNo }}</text></view></view>
          <view v-if="item.displayStatus === '已报名'" class="arrival"><xy-icon name="clock" :size="29" color="#0B756E" /><text>请留意专场通知，并于20:15前到店。</text></view>
          <view v-else-if="item.displayStatus === '专场已取消'" class="arrival muted"><xy-icon name="info" :size="29" color="#7C8E89" /><text>本场福利钓专场已取消，详情请联系商家。</text></view>
        </view>
      </view>
      <view v-else class="empty"><view><xy-icon name="medal" :size="58" color="#8CA09B" /></view><text>还没有福利钓报名</text><text>开放场次中可以查看公告并选择一个位置。</text><button @click="goBenefit">查看福利钓专场</button></view>
    </view>
    <view class="xy-safe-bottom" />
  </view>
</template>

<script>
import { appRequest, ensureMemberSession } from '../../utils/api'
export default {
  data() { return { records: [], loading: true, error: '' } },
  onShow() { this.load() },
  methods: {
    async load() { this.loading = true; this.error = ''; try { await ensureMemberSession(); this.records = await appRequest({ url: '/app/benefit-bookings' }) } catch (error) { this.error = (error && error.message) || '暂时无法读取报名记录' } finally { this.loading = false } },
    formatDate(value) { const [y,m,d] = String(value).split('-'); return `${y}年${Number(m)}月${Number(d)}日` },
    money(value) { return Number(value || 0).toFixed(2) },
    statusClass(value) { return value === '已报名' ? 'active' : value === '报名确认中' ? 'pending' : 'muted' },
    goBenefit() { uni.redirectTo({ url: '/pages/benefit/benefit' }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3;color:#18322e}.wrap{padding:24rpx}.records{display:flex;flex-direction:column;gap:18rpx}.record{padding:25rpx;border:1rpx solid #dbe8e4;border-radius:29rpx;background:#f8fcfa}.record-top{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20rpx;border-bottom:1rpx solid #e1ebe8}.record-top>view{display:flex;flex-direction:column;gap:7rpx}.record-top>view text:first-child{font-size:28rpx;font-weight:780}.record-top>view text:last-child{color:#5e746f;font-size:22rpx}.status{padding:8rpx 14rpx;border-radius:16rpx;font-size:20rpx;font-weight:700}.status.active{background:#dcefe9;color:#0b756e}.status.pending{background:#f2e7d2;color:#845d29}.status.muted{background:#e5ebe9;color:#758782}.record-main{display:flex;align-items:center;gap:20rpx;padding-top:21rpx}.seat{display:flex;width:82rpx;height:82rpx;align-items:center;justify-content:center;flex-direction:column;border-radius:25rpx;background:#dcefe9;color:#0b756e}.seat text:first-child{font-size:31rpx;font-weight:820}.seat text:last-child{font-size:17rpx}.info{display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx}.info text:first-child{font-size:25rpx;font-weight:750}.info text:nth-child(2){color:#6c817c;font-size:20rpx}.info text:last-child{overflow:hidden;color:#8b9a96;font-size:17rpx;text-overflow:ellipsis;white-space:nowrap}.arrival{display:flex;align-items:center;gap:10rpx;margin-top:18rpx;padding:15rpx 17rpx;border-radius:19rpx;background:#e6f3ef;color:#3e665e;font-size:20rpx}.arrival.muted{background:#ebefee;color:#71817d}.empty{display:flex;align-items:center;flex-direction:column;padding:110rpx 30rpx;text-align:center}.empty>view{display:flex;width:110rpx;height:110rpx;align-items:center;justify-content:center;border-radius:34rpx;background:#dfece8}.empty>text:nth-child(2){margin-top:24rpx;font-size:30rpx;font-weight:780}.empty>text:nth-child(3){margin-top:11rpx;color:#748984;font-size:21rpx}.empty button{height:80rpx;margin-top:28rpx;padding:0 32rpx;border-radius:23rpx;background:#0b756e;color:#f4fbf9;font-size:24rpx;font-weight:720;line-height:80rpx}
</style>
