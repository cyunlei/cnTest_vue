import axios from "axios";
import {
	UserStore
} from '@/stores/module/UserStore';
import {
	ElNotification,
	ElMessage
} from 'element-plus'

// 懒加载 router，避免与 LoginView 循环依赖导致页面打不开
const getRouter = () => import("@/router").then(m => m.default);
// ======进行基本的配置======
// 后端接口的域名设置

axios.defaults.baseURL = 'http://127.0.0.1:8080'
// axios.defaults.baseURL = 'http://127.0.0.1:20000'
//请求成功还是失败的状态码范围
axios.defaults.validateStatus = function(status) {
	return true
	// return status >=200 && status <300;
}

//请求自动携带cookie
axios.defaults.withCredentials = true


// 添加请求拦截器
axios.interceptors.request.use(function(config) {
	// 在发送请求之前做些什么
	const noAuthUrls = ['/accounts/api/login', '/accounts/api/check_account_exist', '/accounts/api/register', '/accounts/api/send_email_code', '/accounts/api/email_code_login']
	if (!noAuthUrls.some(u => config.url?.includes(u))) {
		//在请求配置中添加token
		const ustore = UserStore()
		const token = ustore.token
		config.headers.Authorization = 'Bearer ' + token
	}
	return config;
}, function(error) {
	// 对请求错误做些什么
	return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
	// 对响应数据做点什么
	if (response.status < 300) return response
	if (response.status === 401) {
		ElMessage({
			message: '您的登录已过期，请重新登录！',
			type: 'warning',
			duration: 3000
		});
		getRouter().then(router => router.push({ name: 'Login' }))
	} else if (response.status === 400) {
		ElMessage({
			message: response.data,
			type: 'warning',
			duration: 1000
		});
	} else if (response.status === 500) {
		ElMessage({
			message: '【code:5000】服务端异常！',
			type: 'warning',
			duration: 1000
		});
	} else {
		// 其他的响应状态码提示
		ElMessage({
			message: response.data.detail,
			type: 'warning',
			duration: 1000
		});
	}
	return response;
});
//后端请求接口封装
export default{
	//用户登录（密码方式
	loginApi(params){
		return axios.post("/accounts/api/login",params)
	},
	//账号密码注册
	registerApi(params){
		return axios.post("/accounts/api/register",params)
	},
	//发送邮箱验证吗
	sendEmailCodeApi(params){
		return axios.post("/accounts/api/send_email_code",params)
	},
	//检查用户名/邮箱/手机是否已存在
	checkAccountExistApi(params){
		return axios.post("/accounts/api/check_account_exist",params)
	},
	//邮箱验证码登录（自动注册新用户）
	emailCodeLoginApi(params){
		return axios.post("/accounts/api/email_code_login",params)
	},
	//修改密码（原密码方式}
	changePasswordApi(params){
		return axios.post("/accounts/api/change_password",params)
	},
	//邮箱验证码修改密码
	emailCodePasswordApi(params){
		return axios.post("/accounts/api/email_code_password",params)
	},
}

