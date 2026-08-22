<template>
  <view class="page"><xy-header title="用户服务协议" /><view class="document">
    <text class="title">成泰钓虾俱乐部用户服务协议</text><text class="updated">更新日期：2026 年 8 月 21 日</text>
    <view v-for="section in sections" :key="section.title" class="section"><text>{{ section.title }}</text><text v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</text></view>
    <view class="footer-note">如对本协议有疑问，可通过小程序“联系客服”联系门店。</view>
  </view></view>
</template>
<script>
export default { data(){return{sections:[
  {title:'一、服务说明',paragraphs:['成泰钓虾俱乐部小程序提供微信账号登录、会员资料、门店信息、预约选座、会员码、商品浏览、订单、收货地址、售后申请和客服入口等服务。具体可用内容以小程序页面和门店实际运营情况为准。']},
  {title:'二、账号使用',paragraphs:['你需要使用本人微信身份登录，并保证填写的昵称、手机号、收货信息真实有效。请妥善保管账号，不得利用本服务实施违法违规行为或影响其他用户正常使用。']},
  {title:'三、预约规则',paragraphs:['预约成功后请按约定时间到店，向工作人员出示会员码完成签到。不能到店时请在允许的时间内主动取消。场次、座位、续约及爽约规则以预约页面当时展示为准。']},
  {title:'四、会员与订单',paragraphs:['会员开通和商品订单的可用付款方式以下单页面实际展示为准。选择微信支付时，你在微信收银台确认后完成扣款，支付成功后会员权益或订单状态即时生效；若门店当前仅开放到店付款，提交申请不会自动扣款，需门店确认收款后才会生效，逾期未付款的申请会自动关闭。商品库存、优惠、配送和自提信息以下单页面及门店确认为准。']},
  {title:'五、售后与责任',paragraphs:['你可以在符合页面条件时提交退款或售后申请，门店将结合订单和实际交付情况处理。因网络、系统维护或不可抗力造成短时不可用时，我们会尽力恢复服务。']},
  {title:'六、协议更新',paragraphs:['服务调整时，本协议可能相应更新。更新内容会在本页面展示；继续使用服务表示你接受更新后的协议。']}
]}} }
</script>
<style scoped>
.page{min-height:100vh;background:#edf5f3}.document{margin:16rpx 26rpx 44rpx;padding:34rpx 30rpx;border:1rpx solid #dae7e4;border-radius:30rpx;background:#f9fcfb}.title,.updated{display:block}.title{color:#17322d;font-size:36rpx;font-weight:800;line-height:1.35}.updated{margin-top:12rpx;color:#84938f;font-size:21rpx}.section{margin-top:34rpx}.section>text:first-child{display:block;color:#213b36;font-size:27rpx;font-weight:750}.section>text:not(:first-child){display:block;margin-top:13rpx;color:#586e68;font-size:24rpx;line-height:1.8;text-align:justify}.footer-note{margin-top:36rpx;padding:22rpx;border-radius:20rpx;background:#e4f2ef;color:#55716b;font-size:22rpx;line-height:1.6}
</style>
