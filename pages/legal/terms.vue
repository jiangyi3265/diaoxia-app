<template>
  <view class="page"><xy-header title="用户服务协议" /><view class="document">
    <text class="title">成泰钓虾俱乐部用户服务协议</text><text class="updated">更新日期：2026 年 8 月 31 日</text>
    <view v-for="section in sections" :key="section.title" class="section"><text>{{ section.title }}</text><text v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</text></view>
    <view class="footer-note">如对本协议有疑问，可通过小程序“联系客服”联系门店。</view>
  </view></view>
</template>
<script>
export default { data(){return{sections:[
  {title:'一、服务说明',paragraphs:['成泰钓虾俱乐部小程序提供微信账号登录、会员资料、门店信息、普通预约选座、福利钓专场报名、会员码、门店好物展示和客服入口等服务。具体可用内容以小程序页面和门店实际运营情况为准。']},
  {title:'二、账号使用',paragraphs:['你需要使用本人微信身份登录，并保证主动填写的昵称、手机号等资料真实有效。请妥善保管账号，不得利用本服务实施违法违规行为或影响其他用户正常使用。']},
  {title:'三、普通预约规则',paragraphs:['普通预约成功后请按约定时间到店，向工作人员出示会员码完成签到。不能到店时请在允许的时间内主动取消。场次、座位、续约及爽约规则以预约页面当时展示为准。']},
  {title:'四、福利钓专场',paragraphs:['福利钓专场是独立的付费报名服务，不要求会员身份。每个微信用户在同一场专场中只能报名一个座位，但可以分别报名不同日期的专场。','报名前请完整阅读并主动确认当场公告；公告会说明奖品和开闭场条件。提交微信支付并收到报名成功结果后座位才最终生效，报名成功后用户端不提供自行取消入口。如遇特殊情况，可通过客服与门店联系。场次状态及到店安排以小程序当场展示和商家通知为准。']},
  {title:'五、会员与门店好物',paragraphs:['会员开通的付款方式以办理页面实际展示为准。选择微信支付时，你在微信收银台确认后完成扣款，支付成功后会员权益生效。门店好物页面仅用于展示商品介绍和门店参考价，不提供线上下单、线上商品收款或配送服务；实际价格、库存、购买和售后均以门店现场为准。']},
  {title:'六、付款处理与责任',paragraphs:['如对会员付款、福利钓报名或其他服务有疑问，可通过客服与门店联系，门店将结合实际情况处理。因网络、系统维护或不可抗力造成短时不可用时，我们会尽力恢复服务。']},
  {title:'七、协议更新',paragraphs:['服务调整时，本协议可能相应更新。更新内容会在本页面展示；继续使用服务表示你接受更新后的协议。']}
]}} }
</script>
<style scoped>
.page{min-height:100vh;background:#edf5f3}.document{margin:16rpx 26rpx 44rpx;padding:34rpx 30rpx;border:1rpx solid #dae7e4;border-radius:30rpx;background:#f9fcfb}.title,.updated{display:block}.title{color:#17322d;font-size:36rpx;font-weight:800;line-height:1.35}.updated{margin-top:12rpx;color:#84938f;font-size:21rpx}.section{margin-top:34rpx}.section>text:first-child{display:block;color:#213b36;font-size:27rpx;font-weight:750}.section>text:not(:first-child){display:block;margin-top:13rpx;color:#586e68;font-size:24rpx;line-height:1.8;text-align:justify}.footer-note{margin-top:36rpx;padding:22rpx;border-radius:20rpx;background:#e4f2ef;color:#55716b;font-size:22rpx;line-height:1.6}
</style>
