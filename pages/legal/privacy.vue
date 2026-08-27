<template>
  <view class="page"><xy-header title="隐私政策" /><view class="document">
    <text class="title">成泰钓虾俱乐部隐私政策</text><text class="updated">更新日期：2026 年 8 月 26 日</text>
    <view class="notice"><xy-icon name="shield" :size="34" color="#0B756E" /><text>我们仅在提供预约、会员和客服服务所必需的范围内处理信息。</text></view>
    <view v-for="section in sections" :key="section.title" class="section"><text>{{ section.title }}</text><text v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</text></view>
    <view class="footer-note">如需查询、更正或删除相关信息，可通过小程序“联系客服”提交请求。</view>
  </view></view>
</template>
<script>
export default { data(){return{sections:[
  {title:'一、我们收集的信息',paragraphs:['登录时，我们通过微信登录凭证创建小程序账号，不在小程序中读取你的微信密码。你在会员资料页主动点击“微信授权绑定”后，微信会向我们返回经过验证的手机号，用于联系服务以及匹配门店预建会员档案；未主动点击时我们不会申请手机号。你主动提供或业务产生的信息还可能包括昵称、会员信息、预约与签到记录、会员付款结果和客服沟通所需信息。使用微信支付办理会员时，支付由微信支付完成，我们仅接收业务单号、支付结果和交易单号等必要信息，不会获取你的银行卡号或支付密码。','使用门店导航时，地图能力会根据你的主动操作处理门店位置；我们不会在后台持续获取你的实时位置。']},
  {title:'二、信息使用目的',paragraphs:['上述信息用于完成账号识别、预约选座、到店核验、会员服务、安全保障和客户服务，不用于与这些目的无关的用途。']},
  {title:'三、信息共享',paragraphs:['为实现微信登录、小程序运行、地图导航和必要的基础设施服务，相关平台可能按其规则处理必要数据。除法律法规要求或完成你主动申请的服务外，我们不会出售你的个人信息。']},
  {title:'四、存储与保护',paragraphs:['我们会采取合理的访问控制和安全措施保护信息，并在实现服务目的所需期间保存。法律法规另有保存期限要求的，按相关要求处理。']},
  {title:'五、你的权利',paragraphs:['你可以在“会员资料”中查看或修改部分信息，也可以联系客服申请查询、更正或删除相关信息。退出登录会清除本机登录状态，但不会自动删除为履行会员服务或满足法定要求而需要保留的记录。']},
  {title:'六、未成年人保护',paragraphs:['未成年人应在监护人指导下使用本服务。监护人发现相关信息需要处理时，可通过客服联系我们。']},
  {title:'七、政策更新',paragraphs:['服务或规则变化时，本政策可能更新，最新内容会持续在本页面提供。']}
]}} }
</script>
<style scoped>
.page{min-height:100vh;background:#edf5f3}.document{margin:16rpx 26rpx 44rpx;padding:34rpx 30rpx;border:1rpx solid #dae7e4;border-radius:30rpx;background:#f9fcfb}.title,.updated{display:block}.title{color:#17322d;font-size:36rpx;font-weight:800;line-height:1.35}.updated{margin-top:12rpx;color:#84938f;font-size:21rpx}.notice{display:flex;align-items:flex-start;gap:13rpx;margin-top:28rpx;padding:22rpx;border-radius:21rpx;background:#e3f2ee;color:#52716a;font-size:22rpx;line-height:1.6}.notice text{flex:1}.section{margin-top:34rpx}.section>text:first-child{display:block;color:#213b36;font-size:27rpx;font-weight:750}.section>text:not(:first-child){display:block;margin-top:13rpx;color:#586e68;font-size:24rpx;line-height:1.8;text-align:justify}.footer-note{margin-top:36rpx;padding:22rpx;border-radius:20rpx;background:#e4f2ef;color:#55716b;font-size:22rpx;line-height:1.6}
</style>
