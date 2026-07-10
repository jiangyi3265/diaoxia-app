<template>
	<view class="xy-icon" :style="style"></view>
</template>

<script>
/**
 * 虾语线性图标 —— 统一 24 视框、纯描边、圆角端点。
 * 通过 data-uri 背景渲染，颜色由 color 注入（单色线性，非彩色 SVG）。
 */
const ICONS = {
	home: '<path d="M3.5 10.6 12 4l8.5 6.6"/><path d="M5.4 9.3V20h13.2V9.3"/><path d="M9.6 20v-5.4h4.8V20"/>',
	calendar: '<rect x="3.6" y="5" width="16.8" height="15" rx="3"/><path d="M3.6 9.4h16.8"/><path d="M8 3.4v3.2M16 3.4v3.2"/>',
	'calendar-check': '<rect x="3.6" y="5" width="16.8" height="15" rx="3"/><path d="M3.6 9.4h16.8"/><path d="M8 3.4v3.2M16 3.4v3.2"/><path d="M8.6 14.6l2.1 2.1 4.1-4.4"/>',
	qrcode: '<rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><path d="M14 14h3M20 14v3M14 20h3M20 20v.02M17 17v.02"/>',
	bag: '<path d="M6.2 8.4h11.6l-1 10.7a1.4 1.4 0 0 1-1.4 1.3H8.6a1.4 1.4 0 0 1-1.4-1.3L6.2 8.4Z"/><path d="M9 8.4V6.8a3 3 0 0 1 6 0v1.6"/>',
	user: '<circle cx="12" cy="8.2" r="3.6"/><path d="M5.4 19.6a6.7 6.7 0 0 1 13.2 0"/>',
	clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3.1 2"/>',
	location: '<path d="M12 21c4.1-4.5 6.4-7.9 6.4-11A6.4 6.4 0 0 0 5.6 10c0 3.1 2.3 6.5 6.4 11Z"/><circle cx="12" cy="10" r="2.4"/>',
	phone: '<path d="M6.2 4.6h2.9l1.5 3.8-2.1 1.5a11.5 11.5 0 0 0 5 5l1.5-2.1 3.8 1.5v2.9a2 2 0 0 1-2.2 2A15.2 15.2 0 0 1 4.2 6.8 2 2 0 0 1 6.2 4.6Z"/>',
	'chevron-right': '<path d="M9.6 5.4 16 12l-6.4 6.6"/>',
	'chevron-left': '<path d="M14.4 5.4 8 12l6.4 6.6"/>',
	'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8.6 7H17v8.4"/>',
	scan: '<path d="M4 8.6V6.2a2.2 2.2 0 0 1 2.2-2.2H8.6M15.4 4h2.4A2.2 2.2 0 0 1 20 6.2v2.4M20 15.4v2.4a2.2 2.2 0 0 1-2.2 2.2H15.4M8.6 20H6.2A2.2 2.2 0 0 1 4 17.8V15.4"/><path d="M3.8 12h16.4"/>',
	gift: '<rect x="4" y="9" width="16" height="4" rx="1.4"/><path d="M5.4 13v6.3a1.3 1.3 0 0 0 1.3 1.3h10.6a1.3 1.3 0 0 0 1.3-1.3V13"/><path d="M12 9v11.6"/><path d="M12 9C11 7 9.4 5.4 8 6.1 6.6 6.8 7.6 9 9.8 9Z"/><path d="M12 9c1-2 2.6-3.6 4-2.9 1.4.7.4 2.9-1.8 2.9Z"/>',
	wallet: '<rect x="3.6" y="6" width="16.8" height="13" rx="3"/><path d="M3.6 10.2h16.8"/><path d="M15.6 14.4h1.6"/>',
	card: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M3 10.4h18"/><path d="M7 14.4h4.2"/>',
	bell: '<path d="M6.6 10.4a5.4 5.4 0 0 1 10.8 0c0 4 1.6 5.4 1.6 5.4H5s1.6-1.4 1.6-5.4Z"/><path d="M10 18.4a2 2 0 0 0 4 0"/>',
	shield: '<path d="M12 3.4 5.6 5.9V11c0 4 2.7 7 6.4 8.6 3.7-1.6 6.4-4.6 6.4-8.6V5.9L12 3.4Z"/><path d="M9.4 11.6l1.8 1.8 3.4-3.6"/>',
	refresh: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19.2 4.4v3.6h-3.6"/>',
	plus: '<path d="M12 5.6v12.8M5.6 12h12.8"/>',
	minus: '<path d="M5.6 12h12.8"/>',
	check: '<path d="M5 12.6l4.6 4.4L19 7.2"/>',
	close: '<path d="M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8"/>',
	edit: '<path d="M4 20h4l9.6-9.6-4-4L4 16v4Z"/><path d="M13.4 6.6l4 4"/>',
	filter: '<path d="M4 6.4h16l-6.2 7.2v5.2l-3.6 1.4v-6.6L4 6.4Z"/>',
	search: '<circle cx="11" cy="11" r="6.2"/><path d="M20 20l-4.6-4.6"/>',
	cart: '<circle cx="9.2" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.4 4.6H6l1.9 10.5a1.1 1.1 0 0 0 1.1.9h7.6a1.1 1.1 0 0 0 1.1-.9L20 8H7"/>',
	truck: '<path d="M3.4 6.6h9.6v9H3.4z"/><path d="M13 9.6h3.6l3.4 3.4v2.6H13z"/><circle cx="7" cy="17.6" r="1.7"/><circle cx="16.6" cy="17.6" r="1.7"/>',
	star: '<path d="M12 4.4l2.5 5 5.5.8-4 3.9.95 5.5L12 17l-4.9 2.6.95-5.5-4-3.9 5.5-.8L12 4.4Z"/>',
	crown: '<path d="M4 8.2l3.2 2.8L12 5l4.8 6 3.2-2.8-1.7 10.4H5.7L4 8.2Z"/><path d="M5.9 18.8h12.2"/>',
	info: '<circle cx="12" cy="12" r="8.2"/><path d="M12 11v5.4"/><path d="M12 7.9v.2"/>',
	share: '<circle cx="6.4" cy="12" r="2.3"/><circle cx="17.2" cy="6.4" r="2.3"/><circle cx="17.2" cy="17.6" r="2.3"/><path d="M8.4 11l6.8-3.5M8.4 13l6.8 3.5"/>',
	seat: '<path d="M6.4 11V7.2a2.2 2.2 0 0 1 2.2-2.2h6.8a2.2 2.2 0 0 1 2.2 2.2V11"/><rect x="5" y="11" width="14" height="4.4" rx="1.6"/><path d="M6.6 15.4V19M17.4 15.4V19"/>',
	ticket: '<path d="M4 8A1.6 1.6 0 0 1 5.6 6.4h12.8A1.6 1.6 0 0 1 20 8v2a2 2 0 0 0 0 4v2a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 16v-2a2 2 0 0 0 0-4V8Z"/><path d="M13 6.4v11.2"/>',
	headset: '<path d="M5 13.4v-1.2a7 7 0 0 1 14 0v1.2"/><rect x="3.6" y="13" width="3.6" height="5.4" rx="1.4"/><rect x="16.8" y="13" width="3.6" height="5.4" rx="1.4"/><path d="M19 18.4v.6a2.4 2.4 0 0 1-2.4 2.4H12.4"/>',
	doc: '<rect x="5.2" y="3.4" width="13.6" height="17.2" rx="2.8"/><path d="M8.6 8.2h6.8M8.6 12h6.8M8.6 15.8h4.2"/>',
	eye: '<path d="M2.6 12S6 5.6 12 5.6 21.4 12 21.4 12 18 18.4 12 18.4 2.6 12 2.6 12Z"/><circle cx="12" cy="12" r="2.7"/>',
	heart: '<path d="M12 20s-7-4.3-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7-2.3C19 15.7 12 20 12 20Z"/>',
	warning: '<path d="M12 4 3 19.2h18L12 4Z"/><path d="M12 10.2v4.6M12 17.2v.2"/>',
	fish: '<path d="M4.2 12c2.8-4.1 8-5.4 12.2-3.4 2 1 3.4 2.4 3.9 3.4-0.5 1-1.9 2.4-3.9 3.4C12.2 17.4 7 16.1 4.2 12Z"/><path d="M4.2 12s-1.8-1-1.8-3.2M4.2 12s-1.8 1-1.8 3.2"/><path d="M16.4 10.8v.02"/>',
	compass: '<circle cx="12" cy="12" r="8.2"/><path d="M15.4 8.6 13.4 13l-4.4 2 2-4.4 4.4-2Z"/>',
	medal: '<circle cx="12" cy="9.4" r="5"/><path d="M9 13.8 7.6 20.4 12 18l4.4 2.4-1.4-6.6"/><path d="M12 7v2.4l1.6 1"/>',
	tag: '<path d="M4.4 12.8 11.2 6a2 2 0 0 1 1.4-.6h4.4a2 2 0 0 1 2 2v4.4a2 2 0 0 1-.6 1.4l-6.8 6.8a1.8 1.8 0 0 1-2.6 0l-4.6-4.6a1.8 1.8 0 0 1 0-2.6Z"/><circle cx="15.6" cy="8.4" r="1.1"/>',
	'map-pin-nav': '<path d="M20 4 4 10.4l7 2.6 2.6 7L20 4Z"/>',
	plus2: '<circle cx="12" cy="12" r="8.2"/><path d="M12 8.6v6.8M8.6 12h6.8"/>',
	dot: '<circle cx="12" cy="12" r="3"/>',
	logout: '<path d="M14 5.4H6.6A1.6 1.6 0 0 0 5 7v10a1.6 1.6 0 0 0 1.6 1.6H14"/><path d="M15.4 8.6 18.8 12l-3.4 3.4"/><path d="M18.8 12H9.2"/>',
	camera: '<path d="M4.4 8.6h2.8l1.4-2.2h6.8l1.4 2.2h2.8A1.6 1.6 0 0 1 21.4 10v7.4a1.6 1.6 0 0 1-1.6 1.6H4.2A1.6 1.6 0 0 1 2.6 17.4V10.2A1.6 1.6 0 0 1 4.4 8.6Z"/><circle cx="12" cy="13.4" r="3.2"/>',
	dashboard: '<rect x="3.6" y="3.6" width="7" height="7" rx="2"/><rect x="13.4" y="3.6" width="7" height="7" rx="2"/><rect x="3.6" y="13.4" width="7" height="7" rx="2"/><rect x="13.4" y="13.4" width="7" height="7" rx="2"/>',
	invoice: '<path d="M6 3.6h9l3 3v13.4l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2V3.6Z"/><path d="M8.6 9h6.8M8.6 12.4h6.8"/>',
	chat: '<path d="M4.4 5.6h15.2A1.4 1.4 0 0 1 21 7v8.6a1.4 1.4 0 0 1-1.4 1.4H9.2L5 20.4V17H4.4A1.4 1.4 0 0 1 3 15.6V7a1.4 1.4 0 0 1 1.4-1.4Z"/>'
}

export default {
	name: 'xy-icon',
	props: {
		name: { type: String, default: '' },
		size: { type: [Number, String], default: 40 },
		color: { type: String, default: '#142320' },
		weight: { type: [Number, String], default: 1.7 }
	},
	computed: {
		style() {
			const inner = ICONS[this.name] || ''
			const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='" +
				this.color + "' stroke-width='" + this.weight +
				"' stroke-linecap='round' stroke-linejoin='round'>" + inner + "</svg>"
			const uri = 'data:image/svg+xml,' + encodeURIComponent(svg)
			const s = typeof this.size === 'number' ? this.size + 'rpx' : this.size
			return {
				width: s,
				height: s,
				backgroundImage: 'url("' + uri + '")'
			}
		}
	}
}
</script>

<style scoped>
.xy-icon {
	display: inline-block;
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	flex-shrink: 0;
}
</style>
