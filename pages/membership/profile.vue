<template>
  <view class="page"><xy-header title="会员资料" />
    <view class="wrap">
      <view class="identity-card">
        <view class="avatar">{{ (form.nickname || '微').slice(0,1) }}</view>
        <view><text class="identity-name">{{ form.nickname || '微信会员' }}</text><text class="identity-note">会员资料仅用于预约与订单联系</text></view>
      </view>
      <view class="info-strip"><view><text>邀请码</text><text>{{ profile.inviteCode || '--' }}</text></view><view><text>会员卡</text><text>{{ profile.card && profile.card.cardNo || '未开通' }}</text></view></view>
      <view class="form-card">
        <view class="field"><text class="label">昵称</text><input v-model="form.nickname" maxlength="100" placeholder="请输入昵称" /></view>
        <view class="field"><text class="label">手机号</text><input v-model="form.mobile" type="number" maxlength="11" placeholder="用于预约和订单联系" /></view>
      </view>
      <button class="submit" :disabled="saving || !form.nickname" @click="save">{{ saving ? '正在保存' : '保存资料' }}</button>
    </view>
  </view>
</template>
<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default { data(){return{profile:{},form:{nickname:'',mobile:''},saving:false}}, onShow(){this.load()}, methods:{ async load(){try{await ensureMemberSession();this.profile=await appRequest({url:'/app/me'});this.form.nickname=this.profile.nickname||'';this.form.mobile=this.profile.mobile||''}catch(error){showRequestError(error)}}, async save(){if(!this.form.nickname)return;this.saving=true;try{await appRequest({url:'/app/me',method:'PUT',data:this.form});uni.showToast({title:'资料已保存',icon:'success'});await this.load()}catch(error){showRequestError(error)}finally{this.saving=false}} } }
</script>
<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:28rpx}.identity-card{display:flex;align-items:center;gap:22rpx;padding:30rpx;border:1rpx solid #dbe8e4;border-radius:30rpx;background:#f8fcfa}.avatar{display:flex;align-items:center;justify-content:center;width:88rpx;height:88rpx;border-radius:28rpx;background:#0b756e;color:#f3fcf9;font-size:32rpx;font-weight:750}.identity-card>view:last-child{display:flex;flex-direction:column;gap:7rpx}.identity-name{font-size:30rpx;font-weight:750}.identity-note{color:#788b86;font-size:21rpx}.info-strip{display:grid;grid-template-columns:1fr 1fr;gap:14rpx;margin-top:18rpx}.info-strip view{display:flex;flex-direction:column;gap:8rpx;padding:22rpx 24rpx;border-radius:24rpx;background:#e3f0ec}.info-strip text:first-child{color:#718681;font-size:20rpx}.info-strip text:last-child{overflow:hidden;font-size:24rpx;font-weight:700;text-overflow:ellipsis}.form-card{margin-top:28rpx;padding:4rpx 28rpx;border:1rpx solid #dbe8e4;border-radius:30rpx;background:#f8fcfa}.field{padding:25rpx 0;border-bottom:1rpx solid #e0eae7}.field:last-child{border-bottom:0}.label{display:block;margin-bottom:12rpx;color:#536b66;font-size:22rpx;font-weight:650}.field input{height:70rpx;padding:0 18rpx;border-radius:18rpx;background:#edf5f2;font-size:26rpx}.submit{height:94rpx;margin-top:28rpx;border-radius:27rpx;background:#0b756e;color:#f3fcf9;font-size:27rpx;font-weight:700}.submit[disabled]{background:#aebfbb;color:#edf3f1}
</style>
