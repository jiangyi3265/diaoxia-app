<template>
	<view class="hd" :class="'hd-' + variant" :style="wrapStyle">
		<view class="status" :style="{ height: statusH + 'px' }"></view>
		<view class="bar">
			<view class="side left" @click="back">
				<xy-icon v-if="showBack" name="chevron-left" :size="46" :color="iconColor" :weight="2" />
			</view>
			<view class="titles">
				<text class="title" :style="{ color: titleColor }">{{ title }}</text>
				<text v-if="subtitle" class="subtitle" :style="{ color: subColor }">{{ subtitle }}</text>
			</view>
			<view class="side right">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'xy-header',
	props: {
		title: { type: String, default: '' },
		subtitle: { type: String, default: '' },
		variant: { type: String, default: 'plain' }, // plain | brand
		showBack: { type: Boolean, default: true },
		fixed: { type: Boolean, default: false }
	},
	data() {
		return { statusH: 20 }
	},
	created() {
		try {
			const app = getApp()
			this.statusH = (app && app.globalData && app.globalData.statusBarHeight) ||
				uni.getSystemInfoSync().statusBarHeight || 20
		} catch (e) { this.statusH = 20 }
	},
	computed: {
		iconColor() { return this.variant === 'brand' ? '#FFFFFF' : '#142320' },
		titleColor() { return this.variant === 'brand' ? '#FFFFFF' : '#142320' },
		subColor() { return this.variant === 'brand' ? 'rgba(255,255,255,0.72)' : '#6A7D79' },
		wrapStyle() {
			if (this.fixed) return 'position:fixed;top:0;left:0;right:0;z-index:90;'
			return ''
		}
	},
	methods: {
		back() {
			if (!this.showBack) return
			const pages = getCurrentPages()
			if (pages.length > 1) uni.navigateBack()
			else uni.reLaunch({ url: '/pages/index/index' })
		}
	}
}
</script>

<style scoped>
.hd-plain { background: transparent; }
.hd-brand {
	background: linear-gradient(135deg, var(--xy-primary-bright), var(--xy-primary) 55%, var(--xy-lake));
}
.bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	padding: 0 20rpx;
}
.side {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
}
.side.right { justify-content: flex-end; }
.titles {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.title { font-size: 33rpx; font-weight: 700; letter-spacing: 0.5rpx; }
.subtitle { font-size: 21rpx; margin-top: 2rpx; }
</style>
