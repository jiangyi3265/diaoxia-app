<template>
  <view class="page"><xy-header title="会员资料" />
    <view class="wrap">
      <view class="identity-card">
        <view class="avatar">{{ (form.nickname || '微').slice(0,1) }}</view>
        <view><text class="identity-name">{{ form.nickname || '微信会员' }}</text><text class="identity-note">会员资料仅用于预约与会员服务联系</text></view>
      </view>
      <view class="info-strip"><view><text>邀请码</text><text>{{ profile.inviteCode || '--' }}</text></view><view><text>会员卡</text><text>{{ profile.card && profile.card.cardNo || '未开通' }}</text></view></view>
      <view class="form-card">
        <view class="field"><text class="label">昵称</text><input v-model="form.nickname" maxlength="20" placeholder="请输入昵称" /><text v-if="nicknameError" class="field-error">{{ nicknameError }}</text></view>
        <view class="field phone-field">
          <text class="label">微信手机号</text>
          <view class="phone-row"><view><text class="phone-value">{{ form.mobile || '尚未绑定' }}</text><text class="verify-state" :class="{ verified: profile.mobileVerified }">{{ profile.mobileVerified ? '微信已验证' : '待微信验证' }}</text></view><button class="phone-button" open-type="getPhoneNumber" :disabled="bindingMobile" @getphonenumber="bindWechatMobile">{{ bindingMobile ? '绑定中' : (profile.mobileVerified ? '更换号码' : '微信授权绑定') }}</button></view>
          <text class="phone-note">授权后的手机号若与门店后台预建会员一致，会自动关联会员卡和历史权益；手机号不能手工填写，防止他人冒领。</text>
        </view>
      </view>
      <button class="submit" :disabled="saving || !form.nickname" @click="save">{{ saving ? '正在保存' : '保存资料' }}</button>
    </view>
  </view>
</template>
<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'
export default {
  data(){return{profile:{},form:{nickname:'',mobile:''},saving:false,bindingMobile:false,submitted:false}},
  computed:{
    nicknameError(){if(!this.submitted)return'';const value=String(this.form.nickname||'').trim();return!value?'请填写昵称':value.length>20?'昵称最多 20 个字':''},
    formValid(){const name=String(this.form.nickname||'').trim();return !!name&&name.length<=20}
  },
  onShow(){this.load()},
  methods:{
    async load(){try{await ensureMemberSession();this.profile=await appRequest({url:'/app/me'});this.form.nickname=this.profile.nickname||'';this.form.mobile=this.profile.mobile||''}catch(error){showRequestError(error)}},
    async save(){this.submitted=true;if(!this.formValid)return uni.showToast({title:'请检查填写内容',icon:'none'});this.saving=true;try{await appRequest({url:'/app/me',method:'PUT',data:{nickname:this.form.nickname.trim()}});uni.showToast({title:'资料已保存',icon:'success'});await this.load()}catch(error){showRequestError(error)}finally{this.saving=false}},
    async bindWechatMobile(event){
      const detail=(event&&event.detail)||{}
      if(!detail.code){if(String(detail.errMsg||'').includes('deny'))uni.showToast({title:'你已取消手机号授权',icon:'none'});return}
      this.bindingMobile=true
      try{const profile=await appRequest({url:'/app/me/wechat-mobile',method:'POST',data:{code:detail.code}});this.profile=profile||{};this.form.mobile=this.profile.mobile||'';uni.showToast({title:this.profile.card?'会员已自动关联':'手机号已绑定',icon:'success'})}
      catch(error){showRequestError(error)}finally{this.bindingMobile=false}
    }
  }
}
</script>
<style scoped>
.page{min-height:100vh;background:#edf5f3}.wrap{padding:28rpx}.identity-card{display:flex;align-items:center;gap:22rpx;padding:30rpx;border:1rpx solid #dbe8e4;border-radius:30rpx;background:#f8fcfa}.avatar{display:flex;align-items:center;justify-content:center;width:88rpx;height:88rpx;border-radius:28rpx;background:#0b756e;color:#f3fcf9;font-size:32rpx;font-weight:750}.identity-card>view:last-child{display:flex;flex-direction:column;gap:7rpx}.identity-name{font-size:30rpx;font-weight:750}.identity-note{color:#788b86;font-size:21rpx}.info-strip{display:grid;grid-template-columns:1fr 1fr;gap:14rpx;margin-top:18rpx}.info-strip view{display:flex;flex-direction:column;gap:8rpx;padding:22rpx 24rpx;border-radius:24rpx;background:#e3f0ec}.info-strip text:first-child{color:#718681;font-size:20rpx}.info-strip text:last-child{overflow:hidden;font-size:24rpx;font-weight:700;text-overflow:ellipsis}.form-card{margin-top:28rpx;padding:4rpx 28rpx;border:1rpx solid #dbe8e4;border-radius:30rpx;background:#f8fcfa}.field{padding:25rpx 0;border-bottom:1rpx solid #e0eae7}.field:last-child{border-bottom:0}.label{display:block;margin-bottom:12rpx;color:#536b66;font-size:22rpx;font-weight:650}.field input{height:70rpx;padding:0 18rpx;border-radius:18rpx;background:#edf5f2;font-size:26rpx}.submit{height:94rpx;margin-top:28rpx;border-radius:27rpx;background:#0b756e;color:#f3fcf9;font-size:27rpx;font-weight:700}.submit[disabled]{background:#aebfbb;color:#edf3f1}
.field-error{display:block;margin-top:8rpx;color:#c65349;font-size:20rpx}
.phone-row{display:flex;align-items:center;justify-content:space-between;gap:18rpx}.phone-row>view{display:flex;min-width:0;flex-direction:column;gap:8rpx}.phone-value{color:#213b36;font-size:27rpx;font-weight:700}.verify-state{width:max-content;padding:5rpx 10rpx;border-radius:12rpx;background:#f4e8df;color:#9a6545;font-size:18rpx;font-weight:650}.verify-state.verified{background:#dcefe9;color:#0b756e}.phone-button{flex:none;height:66rpx;margin:0;padding:0 20rpx;border:1rpx solid #9bcfc5;border-radius:18rpx;background:#e6f4f0;color:#0b756e;font-size:21rpx;font-weight:700;line-height:64rpx}.phone-button[disabled]{opacity:.6}.phone-note{display:block;margin-top:15rpx;color:#748984;font-size:20rpx;line-height:1.55}
</style>
