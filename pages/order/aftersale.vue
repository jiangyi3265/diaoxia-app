<template>
  <view class="page">
    <xy-header title="申请退款" />
    <view class="wrap">
      <view class="notice"><xy-icon name="info" :size="30" color="#0a8f84" /><text>提交后由商家审核，审核通过后按原支付渠道退款。演示订单不会产生真实资金变动。</text></view>
      <view class="order-no"><text>退款订单</text><text>{{ orderNo }}</text></view>
      <view class="form-section">
        <text class="label">退款原因</text>
        <picker :range="reasons" @change="reason = reasons[$event.detail.value]">
          <view class="picker" :class="{ placeholder: !reason }"><text>{{ reason || '请选择退款原因' }}</text><xy-icon name="chevron-right" :size="28" color="#91a39f" /></view>
        </picker>
      </view>
      <view class="form-section">
        <view class="label-row"><text class="label">补充说明</text><text>{{ description.length }}/500</text></view>
        <textarea v-model="description" maxlength="500" placeholder="请描述退款原因，方便商家尽快处理" />
      </view>
      <button class="submit" :disabled="!reason || submitting" @click="confirmSubmit">{{ submitting ? '提交中…' : '提交退款申请' }}</button>
      <text class="service-link" @click="contact">有疑问？联系在线客服</text>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

export default {
  data() { return { orderNo:'', reason:'', description:'', submitting:false, reasons:['不想要了或拍错了','商品破损或变质','商品与描述不符','商品数量不符','其他'] } },
  onLoad(query) { this.orderNo = query.orderNo || '' },
  methods: {
    confirmSubmit() {
      if (!this.reason || this.submitting) return
      uni.showModal({ title:'确认申请退款', content:'退款申请提交后需要商家审核，确定继续吗？', confirmText:'提交申请', confirmColor:'#0b8d84', success:({ confirm }) => { if (confirm) this.submit() } })
    },
    async submit() {
      if (!this.orderNo || this.submitting) return
      this.submitting = true
      try {
        await ensureMemberSession()
        await appRequest({ url:`/app/orders/${this.orderNo}/after-sales`, method:'POST', data:{ reason:this.reason, description:this.description } })
        uni.showToast({ title:'退款申请已提交', icon:'success' })
        setTimeout(() => uni.navigateBack(), 700)
      } catch (error) { showRequestError(error) } finally { this.submitting = false }
    },
    contact() { uni.navigateTo({ url:'/pages/service/contact' }) }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:24rpx 28rpx 50rpx}.notice{display:flex;align-items:flex-start;gap:13rpx;padding:22rpx 24rpx;border-radius:22rpx;background:#dff1ed;color:#57736d;font-size:22rpx;line-height:1.55}.notice text{flex:1}.order-no{display:flex;align-items:center;justify-content:space-between;margin-top:20rpx;padding:24rpx 26rpx;border-radius:24rpx;background:#f8fcfa;color:#748681;font-size:22rpx}.order-no text:last-child{max-width:450rpx;overflow:hidden;color:#263c37;font-size:20rpx;text-overflow:ellipsis}.form-section{margin-top:20rpx;padding:26rpx;border-radius:27rpx;background:#f8fcfa}.label-row{display:flex;align-items:center;justify-content:space-between}.label{color:#1d3833;font-size:26rpx;font-weight:750}.label-row>text:last-child{color:#8b9b97;font-size:20rpx}.picker{display:flex;align-items:center;justify-content:space-between;height:82rpx;margin-top:18rpx;padding:0 20rpx;border-radius:19rpx;background:#edf5f3;color:#23413b;font-size:23rpx}.picker.placeholder{color:#8a9a96}textarea{box-sizing:border-box;width:100%;height:210rpx;margin-top:18rpx;padding:20rpx;border-radius:19rpx;background:#edf5f3;color:#263d38;font-size:23rpx;line-height:1.55}.submit{height:88rpx;margin-top:26rpx;border-radius:24rpx;background:#0b8d84;color:#f4fbf9;font-size:27rpx;font-weight:750;line-height:88rpx}.submit[disabled]{background:#afc4bf}.submit::after{border:0}.service-link{display:block;margin-top:22rpx;text-align:center;color:#55756e;font-size:22rpx;text-decoration:underline}
</style>
