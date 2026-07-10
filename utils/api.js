const apiBaseUrl = (typeof process !== 'undefined' && process.env
	? (process.env.VITE_APP_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || '')
	: '').replace(/\/$/, '')

function baseUrl() {
	if (!apiBaseUrl) {
		throw new Error('未配置小程序服务地址，请在构建环境设置 VITE_APP_API_BASE_URL')
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
