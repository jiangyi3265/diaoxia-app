// Vite/uni-app 会在构建阶段将 VITE_* 注入 import.meta.env；process.env 不会
// 自动包含这些变量。默认值保证在微信开发者工具等非标准构建环境中也能访问生产 API。
const apiBaseUrl = (import.meta.env.VITE_APP_API_BASE_URL || 'https://dx.oksja.cn').replace(/\/$/, '')

function baseUrl() {
	if (!apiBaseUrl) {
		throw new Error('未配置小程序服务地址')
	}
	return apiBaseUrl
}

export function request(options) {
	return new Promise((resolve, reject) => {
		let url
		try { url = baseUrl() + options.url } catch (error) { reject(error); return }
		uni.request({
			url,
			method: options.method || 'GET',
			data: options.data,
			header: Object.assign({ 'content-type': 'application/json' }, options.header || {}),
			success: (response) => {
				const body = response.data || {}
				if (response.statusCode >= 200 && response.statusCode < 300 && body.code === 200) {
					resolve(body.data)
					return
				}
				reject(new Error(body.msg || '服务请求失败'))
			},
			fail: () => reject(new Error('网络连接失败，请检查网络后重试'))
		})
	})
}

export const publicRequest = request

export function appRequest(options) {
	const token = uni.getStorageSync('xy.member.token')
	return request(Object.assign({}, options, { header: Object.assign({}, options.header || {}, { 'X-App-Token': token }) }))
}

export function ensureMemberSession() {
	const token = uni.getStorageSync('xy.member.token')
	if (token) return Promise.resolve(token)
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: ({ code }) => request({ url: '/app/auth/session', method: 'POST', data: { code } })
				.then((data) => {
					uni.setStorageSync('xy.member.token', data.memberToken)
					uni.setStorageSync('xy.member.profile', data.member)
					resolve(data.memberToken)
				})
				.catch(reject),
			fail: () => reject(new Error('微信登录失败，请重试'))
		})
	})
}

export function showRequestError(error) {
	uni.showToast({ title: (error && error.message) || '服务暂不可用', icon: 'none' })
}
