<script>
	export default {
		onLaunch: function() {
			try {
				// 本次登录流程升级后，让存量用户只重新确认一次微信登录。
				const loginGateVersion = 'xy.explicit.login.v1'
				if (uni.getStorageSync('xy.login.gate') !== loginGateVersion) {
					uni.removeStorageSync('xy.member.token')
					uni.removeStorageSync('xy.member.profile')
					uni.setStorageSync('xy.login.gate', loginGateVersion)
				}
				const sys = uni.getSystemInfoSync()
				const app = getApp()
				app.globalData = app.globalData || {}
				app.globalData.statusBarHeight = sys.statusBarHeight || 20
			} catch (e) {}
		},
		onShow: function() {},
		onHide: function() {}
	}
</script>

<style>
	/* ============ 虾语 · 设计令牌（青碧·水光） ============ */
	page {
		--xy-primary: #0E9C8E;
		--xy-primary-bright: #16C2B3;
		--xy-primary-deep: #0A8A87;
		--xy-lake: #0C6C88;
		--xy-lake-deep: #0A4F73;

		--xy-bg: #F1F6F5;
		--xy-surface: #FFFFFF;
		--xy-surface-2: #F7FBFA;

		--xy-ink: #142320;
		--xy-ink-2: #3C514D;
		--xy-ink-3: #6A7D79;
		--xy-muted: #9AAAA6;

		--xy-hairline: #E7EEEC;
		--xy-line-strong: #D8E5E1;
		--xy-mint: #E8F5F1;
		--xy-mint-2: #D6EDE7;

		--xy-success: #17A57F;
		--xy-danger: #E1584A;
		--xy-warn: #E4A24C;
		--xy-gold: #C79A55;

		--xy-shadow: 0 8rpx 30rpx rgba(16, 78, 74, 0.06);
		--xy-shadow-lg: 0 16rpx 44rpx rgba(12, 84, 80, 0.12);
		--xy-card-radius: 28rpx;

		background: var(--xy-bg);
		color: var(--xy-ink);
		font-family: -apple-system, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
		font-size: 28rpx;
		-webkit-font-smoothing: antialiased;
	}

	view, text, scroll-view, button, input, textarea, image, navigator {
		box-sizing: border-box;
	}

	button {
		padding: 0;
		margin: 0;
		line-height: 1.4;
		background: transparent;
		border-radius: 0;
		font-size: inherit;
	}
	button::after { border: none; }

	/* ============ 通用工具类 ============ */
	.xy-page {
		min-height: 100vh;
		background: var(--xy-bg);
	}
	.xy-safe-bottom { height: calc(env(safe-area-inset-bottom) + 24rpx); }
	.xy-tabbar-hold { height: calc(env(safe-area-inset-bottom) + 132rpx); }

	.xy-card {
		background: var(--xy-surface);
		border-radius: var(--xy-card-radius);
		box-shadow: var(--xy-shadow);
	}

	.xy-h1 { font-size: 40rpx; font-weight: 700; letter-spacing: -0.5rpx; }
	.xy-h2 { font-size: 32rpx; font-weight: 700; letter-spacing: -0.3rpx; }
	.xy-title { font-size: 30rpx; font-weight: 600; }
	.xy-sub { font-size: 24rpx; color: var(--xy-ink-3); }
	.xy-muted { color: var(--xy-muted); }

	.xy-num {
		font-family: "DIN Alternate", "SF Pro Display", -apple-system, sans-serif;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.xy-section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 6rpx 22rpx;
	}
	.xy-section-title {
		display: flex;
		align-items: center;
		gap: 16rpx;
		font-size: 32rpx;
		font-weight: 700;
		color: var(--xy-ink);
	}
	.xy-section-title::before {
		content: "";
		width: 8rpx;
		height: 30rpx;
		border-radius: 6rpx;
		background: linear-gradient(180deg, var(--xy-primary-bright), var(--xy-primary));
	}
	.xy-section-more {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 24rpx;
		color: var(--xy-ink-3);
	}

	.xy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		height: 96rpx;
		border-radius: 26rpx;
		font-size: 30rpx;
		font-weight: 600;
	}
	.xy-btn-primary {
		background: linear-gradient(120deg, var(--xy-primary-bright), var(--xy-primary) 60%, var(--xy-lake));
		color: #fff;
		box-shadow: 0 14rpx 30rpx rgba(14, 156, 142, 0.28);
	}
	.xy-btn-primary:active { transform: translateY(2rpx); opacity: 0.94; }
	.xy-btn-ghost { background: var(--xy-mint); color: var(--xy-primary-deep); }
	.xy-btn-line {
		background: var(--xy-surface);
		color: var(--xy-ink);
		border: 2rpx solid var(--xy-line-strong);
	}

	.xy-tag {
		display: inline-flex;
		align-items: center;
		gap: 6rpx;
		height: 40rpx;
		padding: 0 16rpx;
		border-radius: 12rpx;
		font-size: 22rpx;
		font-weight: 600;
	}
	.xy-tag-vip { background: linear-gradient(120deg, #FBF0D6, #F3DFAE); color: #8A6A22; }
	.xy-tag-mint { background: var(--xy-mint); color: var(--xy-primary-deep); }
	.xy-tag-danger { background: #FCEAE7; color: var(--xy-danger); }
	.xy-tag-success { background: #E4F5EE; color: var(--xy-success); }
	.xy-tag-warn { background: #FBF1DF; color: #A9781F; }

	.xy-cell {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 28rpx 0;
	}
	.xy-divider { height: 2rpx; background: var(--xy-hairline); }

	.xy-price::before {
		content: "¥";
		font-size: 0.62em;
		font-weight: 700;
		margin-right: 2rpx;
	}
</style>
