<template>
  <view class="page">
    <xy-header title="收货地址" />

    <view class="content">
      <view class="intro">
        <text class="intro-title">常用收货地址</text>
        <text class="intro-note">下单时可快速选择，我们会妥善保护你的信息</text>
      </view>

      <view v-if="addresses.length" class="address-list">
        <view v-for="item in addresses" :key="item.addressId" class="address-card">
          <view class="address-main" @click="edit(item)">
            <view class="address-head">
              <text class="receiver">{{ item.receiverName }}</text>
              <text class="mobile">{{ item.receiverMobile }}</text>
              <text v-if="item.isDefault" class="default-tag">默认</text>
            </view>
            <text class="address-text">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
          </view>
          <view class="edit-button" @click="edit(item)">
            <uni-icons type="compose" size="20" color="#677a78" />
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <view class="empty-icon"><uni-icons type="location" size="32" color="#11a89c" /></view>
        <text class="empty-title">还没有收货地址</text>
        <text class="empty-note">新增地址后，商城下单会更方便</text>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="primary-button" @click="edit()">新增收货地址</button>
    </view>

    <view v-if="editing" class="mask" @click="closeEditor">
      <view class="sheet" @click.stop>
        <view class="sheet-handle" />
        <view class="sheet-head">
          <text class="sheet-title">{{ form.addressId ? '编辑地址' : '新增地址' }}</text>
          <view class="close" @click="closeEditor"><uni-icons type="closeempty" size="24" color="#637270" /></view>
        </view>

        <view class="form-card">
          <view class="field"><text class="field-label">收货人</text><input v-model="form.receiverName" placeholder="请输入姓名" /></view>
          <view class="field"><text class="field-label">手机号</text><input v-model="form.receiverMobile" type="number" maxlength="11" placeholder="请输入手机号" /></view>
          <view class="field"><text class="field-label">省份</text><input v-model="form.province" placeholder="例如：广东省" /></view>
          <view class="field"><text class="field-label">城市</text><input v-model="form.city" placeholder="例如：深圳市" /></view>
          <view class="field"><text class="field-label">区县</text><input v-model="form.district" placeholder="例如：南山区" /></view>
          <view class="field detail-field"><text class="field-label">详细地址</text><textarea v-model="form.detail" maxlength="100" placeholder="街道、门牌号等详细信息" /></view>
        </view>

        <view class="default-row" @click="form.isDefault = !form.isDefault">
          <view>
            <text class="default-title">设为默认地址</text>
            <text class="default-note">下单时优先使用此地址</text>
          </view>
          <switch :checked="form.isDefault" color="#11a89c" @change="form.isDefault = $event.detail.value" />
        </view>

        <view class="sheet-actions">
          <button v-if="form.addressId" class="delete-button" @click="remove">删除</button>
          <button class="save-button" :loading="saving" @click="save">保存地址</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { appRequest, ensureMemberSession, showRequestError } from '../../utils/api'

const blank = () => ({
  receiverName: '',
  receiverMobile: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

export default {
  data() {
    return { addresses: [], editing: false, saving: false, form: blank() }
  },
  onShow() {
    this.load()
  },
  methods: {
    async load() {
      try {
        await ensureMemberSession()
        this.addresses = await appRequest({ url: '/app/addresses' })
      } catch (error) {
        showRequestError(error)
      }
    },
    edit(item) {
      this.form = item ? { ...item, isDefault: !!item.isDefault } : blank()
      this.editing = true
    },
    closeEditor() {
      if (!this.saving) this.editing = false
    },
    validate() {
      if (!this.form.receiverName.trim()) return '请填写收货人姓名'
      if (!/^1\d{10}$/.test(this.form.receiverMobile)) return '请填写正确的手机号'
      if (!this.form.province.trim() || !this.form.city.trim() || !this.form.district.trim()) return '请补全省市区信息'
      if (!this.form.detail.trim()) return '请填写详细地址'
      return ''
    },
    async save() {
      const message = this.validate()
      if (message) return uni.showToast({ title: message, icon: 'none' })
      this.saving = true
      try {
        await appRequest({
          url: '/app/addresses',
          method: this.form.addressId ? 'PUT' : 'POST',
          data: this.form
        })
        this.editing = false
        uni.showToast({ title: '地址已保存', icon: 'success' })
        await this.load()
      } catch (error) {
        showRequestError(error)
      } finally {
        this.saving = false
      }
    },
    remove() {
      uni.showModal({
        title: '删除地址',
        content: '确定删除这条收货地址吗？',
        confirmColor: '#d65b54',
        success: async ({ confirm }) => {
          if (!confirm) return
          try {
            await appRequest({ url: `/app/addresses/${this.form.addressId}`, method: 'DELETE' })
            this.editing = false
            uni.showToast({ title: '已删除', icon: 'success' })
            await this.load()
          } catch (error) {
            showRequestError(error)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#f3f8f7;padding-bottom:150rpx}.content{padding:28rpx 28rpx 20rpx}.intro{padding:8rpx 4rpx 30rpx}.intro-title,.intro-note{display:block}.intro-title{font-size:36rpx;font-weight:800;color:#172522}.intro-note{margin-top:10rpx;font-size:24rpx;color:#7a8b88}.address-list{display:flex;flex-direction:column;gap:18rpx}.address-card{display:flex;align-items:center;padding:30rpx;border:1rpx solid rgba(25,95,89,.08);border-radius:26rpx;background:#fff;box-shadow:0 12rpx 30rpx rgba(25,76,71,.05)}.address-main{flex:1;min-width:0}.address-head{display:flex;align-items:center;gap:16rpx}.receiver{font-size:31rpx;font-weight:800;color:#172522}.mobile{font-size:27rpx;color:#667875}.default-tag{padding:5rpx 12rpx;border-radius:8rpx;background:#e6f8f5;color:#0b958a;font-size:20rpx}.address-text{display:block;margin-top:16rpx;color:#5f706d;font-size:25rpx;line-height:1.6}.edit-button{display:flex;align-items:center;justify-content:center;width:70rpx;height:70rpx;margin-left:18rpx;border-radius:50%;background:#f3f7f6}.empty-state{display:flex;flex-direction:column;align-items:center;padding:120rpx 30rpx}.empty-icon{display:flex;align-items:center;justify-content:center;width:100rpx;height:100rpx;border-radius:30rpx;background:#e6f8f5}.empty-title{margin-top:28rpx;font-size:30rpx;font-weight:700;color:#293735}.empty-note{margin-top:12rpx;color:#899793;font-size:24rpx}.bottom-bar{position:fixed;z-index:5;right:0;bottom:0;left:0;padding:20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));background:rgba(255,255,255,.94);box-shadow:0 -8rpx 30rpx rgba(20,70,66,.08);backdrop-filter:blur(16px)}button::after{border:0}.primary-button,.save-button{height:86rpx;border-radius:24rpx;background:#11a89c;color:#fff;font-size:28rpx;font-weight:700;line-height:86rpx}.mask{position:fixed;z-index:20;inset:0;display:flex;align-items:flex-end;background:rgba(15,31,29,.45)}.sheet{width:100%;max-height:92vh;padding:12rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));border-radius:34rpx 34rpx 0 0;background:#f5f9f8;overflow:auto}.sheet-handle{width:72rpx;height:8rpx;margin:0 auto 20rpx;border-radius:8rpx;background:#d1dddb}.sheet-head{display:flex;align-items:center;justify-content:space-between;padding:4rpx 2rpx 24rpx}.sheet-title{font-size:36rpx;font-weight:800;color:#182724}.close{display:flex;align-items:center;justify-content:center;width:64rpx;height:64rpx;border-radius:50%;background:#e9f0ef}.form-card{padding:0 26rpx;border-radius:26rpx;background:#fff}.field{display:flex;align-items:center;min-height:96rpx;border-bottom:1rpx solid #edf2f1}.field:last-child{border-bottom:0}.field-label{width:150rpx;color:#273633;font-size:26rpx}.field input,.field textarea{flex:1;color:#172522;font-size:26rpx}.detail-field{align-items:flex-start;padding:26rpx 0}.detail-field textarea{height:100rpx;line-height:1.5}.default-row{display:flex;align-items:center;justify-content:space-between;margin-top:20rpx;padding:26rpx;border-radius:24rpx;background:#fff}.default-title,.default-note{display:block}.default-title{font-size:27rpx;font-weight:700;color:#273633}.default-note{margin-top:7rpx;color:#899793;font-size:22rpx}.sheet-actions{display:flex;gap:18rpx;margin-top:24rpx}.sheet-actions button{flex:1;margin:0}.delete-button{height:86rpx;border-radius:24rpx;background:#fff;color:#d45b55;font-size:28rpx;line-height:86rpx}
</style>
