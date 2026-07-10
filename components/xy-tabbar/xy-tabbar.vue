<template>
	<view class="tabbar">
		<view class="tabbar-inner">
			<view
				v-for="(it, i) in items"
				:key="i"
				class="tab-item"
				:class="{ 'is-center': it.center }"
				@click="go(it)"
			>
				<block v-if="it.center">
					<view class="center-btn">
						<xy-icon name="qrcode" :size="46" color="#FFFFFF" :weight="1.8" />
					</view>
					<text class="center-label">会员码</text>
				</block>
				<block v-else>
					<xy-icon
						:name="it.icon"
						:size="44"
						:color="active === it.key ? '#0E9C8E' : '#93A6A1'"
						:weight="active === it.key ? 2 : 1.7"
					/>
					<text class="tab-label" :class="{ on: active === it.key }">{{ it.label }}</text>
					<view v-if="active === it.key" class="tab-dot"></view>
				</block>
			</view>
		</view>
		<view class="safe"></view>
	</view>
</template>

<script>
export default {
	name: 'xy-tabbar',
	props: {
		active: { type: String, default: 'index' }
	},
	data() {
		return {
			items: [
				{ key: 'index', label: '首页', icon: 'home', path: '/pages/index/index' },
				{ key: 'reserve', label: '预约', icon: 'calendar', path: '/pages/reserve/reserve' },
				{ key: 'code', center: true, path: '/pages/membership/code' },
				{ key: 'mall', label: '商城', icon: 'bag', path: '/pages/mall/mall' },
				{ key: 'mine', label: '我的', icon: 'user', path: '/pages/mine/mine' }
			]
		}
	},
	methods: {
		go(it) {
			if (it.key === this.active) return
			if (it.center) {
				uni.navigateTo({ url: it.path })
				return
			}
			uni.reLaunch({ url: it.path })
		}
	}
}
</script>

<style scoped>
.tabbar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.94);
	backdrop-filter: blur(18px);
	border-top: 2rpx solid var(--xy-hairline);
	box-shadow: 0 -6rpx 26rpx rgba(16, 78, 74, 0.05);
}
.tabbar-inner {
	display: flex;
	align-items: flex-end;
	height: 108rpx;
	padding: 0 12rpx;
}
.tab-item {
	flex: 1;
	height: 108rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	position: relative;
}
.tab-label {
	font-size: 21rpx;
	color: #93A6A1;
	letter-spacing: 0.4rpx;
}
.tab-label.on {
	color: var(--xy-primary);
	font-weight: 600;
}
.tab-dot {
	position: absolute;
	bottom: 12rpx;
	width: 8rpx;
	height: 8rpx;
	border-radius: 50%;
	background: var(--xy-primary);
	display: none;
}
.tab-item.is-center {
	flex: 1;
	justify-content: flex-start;
	overflow: visible;
}
.center-btn {
	width: 104rpx;
	height: 104rpx;
	margin-top: -44rpx;
	border-radius: 34rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, var(--xy-primary-bright), var(--xy-primary) 55%, var(--xy-lake));
	box-shadow: 0 14rpx 30rpx rgba(14, 156, 142, 0.4);
	border: 6rpx solid #fff;
}
.center-label {
	margin-top: 8rpx;
	font-size: 21rpx;
	font-weight: 600;
	color: var(--xy-primary);
}
.safe {
	height: env(safe-area-inset-bottom);
}
</style>
