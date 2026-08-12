<template>
	<view class="state" :class="'state-' + type">
		<block v-if="type === 'loading'">
			<view class="skeleton wide" />
			<view class="skeleton medium" />
			<view class="skeleton short" />
		</block>
		<block v-else>
			<view class="icon"><xy-icon :name="iconName" :size="54" :color="iconColor" :weight="1.6" /></view>
			<text class="title">{{ title || defaultTitle }}</text>
			<text v-if="description" class="description">{{ description }}</text>
			<button v-if="actionText" class="action" @click="$emit('action')">{{ actionText }}</button>
		</block>
	</view>
</template>

<script>
export default {
	name: 'xy-state',
	emits: ['action'],
	props: {
		type: { type: String, default: 'empty' },
		title: { type: String, default: '' },
		description: { type: String, default: '' },
		actionText: { type: String, default: '' },
		icon: { type: String, default: '' }
	},
	computed: {
		defaultTitle() { return this.type === 'error' ? '内容加载失败' : '暂时没有内容' },
		iconName() { return this.icon || (this.type === 'error' ? 'warning' : 'compass') },
		iconColor() { return this.type === 'error' ? '#B45D52' : '#0B756E' }
	}
}
</script>

<style scoped>
.state{display:flex;min-height:300rpx;flex-direction:column;align-items:center;justify-content:center;padding:52rpx 34rpx;text-align:center}.icon{display:flex;width:104rpx;height:104rpx;align-items:center;justify-content:center;border-radius:32rpx;background:#dcefe9}.state-error .icon{background:#f5e6e3}.title{margin-top:24rpx;color:#1b3530;font-size:29rpx;font-weight:700}.description{max-width:30em;margin-top:10rpx;color:#758984;font-size:22rpx;line-height:1.6}.action{height:76rpx;margin-top:24rpx;padding:0 30rpx;border-radius:22rpx;background:#0b756e;color:#f4fbf9;font-size:24rpx;font-weight:650;line-height:76rpx}.skeleton{height:32rpx;margin:12rpx;border-radius:12rpx;background:#dce8e5;animation:pulse 1.25s ease-in-out infinite}.wide{width:88%;height:150rpx;border-radius:28rpx}.medium{width:72%}.short{width:46%}@keyframes pulse{50%{opacity:.48}}
</style>
