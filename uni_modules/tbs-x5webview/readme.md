## 概述

腾讯TBS-X5内核在行业内运营多年，一直有内核加载不稳定的问题，原因主要是成本控制带来的下载带宽流控问题，所以内核下发的操作，最好自己来做。

## 功能说明
### 1.集成x5内核后哪些页面会由x5内核渲染？
    
(1). 所有plus.webview.create创建的webview

(2). uni-app中所有vue页面

(3). uni-app中的web-view组件

### 2. uniapp已经提供了x5内核配置，为什么还要自己做加载机制？
    
因为官方以下加载机制导致的x5浏览器内核加载失败问题:

(1). 周五周六（18:00-21:00）服务器维护不支持下载

(2). 频繁下载x5浏览器内核的IP会被限流下载

(3). 离线打包debug环境下，可会导致下载失败

(4). 腾讯x5内核已经进入商业化运营，不交钱根本无法再免费使用
 
所以要拥有一套自己稳定100%可成功加载内核的机制，实现可随时随地免费加载。
 
 
### 3.X5内核能解决什么问题？

(1). x5适配了rom的自定义主题字体，与原生字体保持一致。不会出现一个界面部分字体为原生字体、部分字体为webview字体的问题。之前系统webview在部分手机上不能适配rom自定义主题的字体。（注意：部分设备可能需要重新系统或不支持自定义主题字体）
  
(2). 系统的webview有浏览器兼容问题，低端Android的webview有很多新语法都不支持。使用x5可以拉齐webview内核。对于5+App和wap2app，可以全部拉齐。对于uni-app，由于uni-app自带js引擎，在js和组件层面本身就不存在浏览器兼容问题，只有vue页面的css涉及浏览器兼容问题。如果你想使用比如sticky等新css语法，此时可通过x5拉齐。如果开发者比较注意，不使用太新的语法的话，其实此时x5在这方面没有用处
  
(3). x5内核自带的video实现强于html的video，支持视频格式更多。（这个只能用于5+app和wap2app的html里的自带video，以及uni-app的web-view组件里的video。uni-app默认的video组件本身就是原生的，和x5无关）
  
(4). 远程web页面防劫持是x5内核的一大亮点
  
### 4.验证是否使用x5以及x5版本号的方法

3.4.14+以上的HBuilderX，使用 uni.getSystemInfo ，看返回的 browserName 和 browserVersion
低版本HBuilderX 使用 plus.navigator.getUserAgent()

x5内核的UserAgent如下：

`Mozilla/5.0 (Linux; Android 11; PEXM00 Build/RKQ1.201217.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045738`


### 5.注意事项

(1).从应用市场下载插件导入自己项目后，要先制作自定义插件后，才可以运行使用(示例程序已经打好基座，可以直接运行)

(2).插件需在 Android 5.0-Android13+ 版本可正常使用

(3).腾讯TBS x5内核仅支持Android平台；iOS只能使用自带的WKWebview/UIWebview

(4).尽量使用 HBuilderX 4.0+ 以上的最新版本，以便更好在uni-app和uni-app x中使用uts插件

(5).CPU类型配置不支持“x86”，建议仅配置“armeabi-v7a”和“arm64-v8a”否则可能无法正常使用X5内核

(6).因为项目中已经包含了webview-x5-release.arr依赖，在manifest.json文件中，“App模块配置”不要勾选“Android X5 Webview(腾讯TBS)”

(7).因为官方强制所有插件上架必须以UTS集成方式发布，如果您是uni小程序sdk集成方式(即以Android工程为主体的自定义打包)的项目，或者是以传统的uni原生插件集成方式集成(即nativeplugins方式)的项目
请通过DCloud IM私信留言，提供nativeplugins集成的支持。

(8).官方云打包100兆以上大小有收费限制，自定义打包请适当注意体积大小，推荐采用网络加载内核方式(即loadUrlX5Core方法加载x5内核)，将uni_modules\tbs-x5webview\utssdk\app-android\assets文件夹删掉再进行自定义打包
，如自定义打包、集成、调试遇到任何困难，请及时通过DCloud IM私信留言，提供在线支持。

## 完整代码示例

```html
<template>
	<view>
		<view style="display: flex;margin:10px;flex-direction: column;">
			<view><text style="font-weight: bold;">浏览器内核：</text>{{userAgent}}</view>
			<view><text style="font-weight: bold;">系统CPU架构：</text>{{supportedAbis}}</view>
			<view><text style="font-weight: bold;">系统版本：</text>{{osName}}</view>
			<view><text style="font-weight: bold;">x5版本号：</text>{{x5Version}}</view>
			<view><text style="font-weight: bold;">x5下载地址：</text>{{x5Url}}</view>
			<view><text style="font-weight: bold;">x5下载进度：</text>{{x5Progress}}</view>
			<scroll-view scroll-x="true">
				<y-json-view :json="json" closed />
			</scroll-view>
			<u-row gutter="10" justify="between">
				<u-col span="3">
					<view style="margin-top: 10px;">
						<button type="default" @click="toWebView()">跳转到WebView页面测试</button>
					</view>
				</u-col>
				<u-col span="3">
					<view style="margin-top: 10px;">
						<button type="default" @click="canLoadX5Core()">验证x5内核是否存在并可用</button>
					</view>
				</u-col>
				<u-col span="3">
					<view style="margin-top: 10px;">
						<button type="default" @click="loadUrlX5Core()" :loading="isLoading" :disabled="isLoading">加载远程X5内核</button>
					</view>
				</u-col>
				<u-col span="3">
					<view style="margin-top: 10px;">
						<button type="default" @click="loadLocalX5Core()">加载本地X5内核</button>
					</view>
				</u-col>
			</u-row>
		</view>
	</view>
</template>
<script>
	import { loadUrl , loadLocal,checkAbiType,canLoadX5 } from "@/uni_modules/tbs-x5webview"
	const modal = uni.requireNativePlugin('modal');
	export default {
		data() {
			return {
				userAgent: '',//浏览器版本
				supportedAbis: '',//手机支持的cpu架构
				abiType: '',//架构类型 1-arm32位 2-arm64位  3-其他
				json: {}, //设备信息
				osName:'',//系统名称和版本
				x5Version: '',//加载的x5版本
				x5Url: '',//加载的x5地址
				x5Progress:0,//网络加载进度
				isLoading:false,//是否正在下载中
			}
		},
		created() {
			this.userAgent = plus.navigator.getUserAgent()
			this.osName = plus.os.name + plus.os.version
			this.json = uni.getSystemInfoSync()
			this.checkSupportedAbis()
		},
		methods:{
			//跳转到webview页面测试
			toWebView() {
				uni.navigateTo({
					url: '/pages/index/toWebView'
				});
			},
			//验证x5内核是否存并可用
			canLoadX5Core(){
				let result = canLoadX5()
				console.log('canLoadX5Core--->', result)
				modal.toast({message: result.msg,duration: 2});
			},
			//查看当前手机支持的CPU架构
			checkSupportedAbis() {
				//1-arm32位 2-arm64位  3-其他 x5内核不支持“x86”和其他CPU类型
				let result =checkAbiType()
				console.log('内核验证结果--->', result)
				this.supportedAbis = result.supportedAbis
				this.abiType = result.code
			},
			//重启提示
			showRestartTip(){
				uni.showModal({
					title: '提示',
					content: '腾讯x5内核已经安装完毕，必须重启生效，是否重启？',
					success: function (res) {
						if (res.confirm) {
							console.log('用户点击确定');
							let system = plus.android.importClass('java.lang.System')
							system.exit(0);
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			//网络加载x5内核  推荐使用
			loadUrlX5Core(){
				let _this = this
				//官网新旧版本说明 https://x5.tencent.com/docs.html?indator=aboutX5#SDKCompare
				//旧版本免费，最大仅支持Android 5-13版本
				if(plus.os.version>13||plus.os.version<6){
					modal.toast({message: '腾讯X5内核仅支持Android5-13版本',duration: 2});
					return
				}
				this.isLoading = true
				//1-arm32位 2-arm64位  3-不支持 x5内核不支持“x86”和其他CPU类型
				if (this.abiType === 1) {
					this.x5Version = 46514
					this.x5Url ='https://saas-camp.mvmyun.com/tbs_core_046514_20230612114949_nolog_fs_obfs_armeabi_release.tbs'
				} else if (this.abiType === 2) {
					this.x5Version = 46515
					this.x5Url ='https://saas-camp.mvmyun.com/tbs_core_046515_20230612112541_nolog_fs_obfs_arm64-v8a_release.tbs'
				} else {
					modal.toast({message: '没有符合当前手机的可用x5内核使用',duration: 2});
					this.isLoading = false
					return
				}
				
				return new Promise((resolve, reject) => {
					//加载网络内核
					loadUrl(_this.x5Version,_this.x5Url,{
						//加载进度
						onProgressUpdate(progress){
							console.log('内核下载进度--->',progress+'%')
							_this.x5Progress = progress + '%'
						},
						//加载成功
						success(msg){
							console.log('success--->',msg)
							_this.isLoading = false
							modal.toast({message: msg,duration: 2});
							_this.showRestartTip()
						},
						//加载错误
						error(code,msg){
							console.log('error--->',code,msg)
							_this.isLoading = false
							modal.toast({message: msg,duration: 2});
						},
						//是否可以加载X5内核
						isCanLoadX5(isCan){
							console.log('是否可以加载X5内核--->',isCan)
						}
					})
				})
			},
			
			//本地加载x5内核  
			loadLocalX5Core(){
				//官网新旧版本说明 https://x5.tencent.com/docs.html?indator=aboutX5#SDKCompare
				//旧版本免费，最大仅支持Android 5-13版本
				if(plus.os.version>13||plus.os.version<6){
					modal.toast({message: '腾讯X5内核仅支持Android5-13版本',duration: 4});
					return
				}
				//1-arm32位 2-arm64位  3-不支持 x5内核不支持“x86”和其他CPU类型
				if (this.abiType === 1) {
					this.x5Version = 46514
					this.x5Url ='/tbs/tbs_core_046514_20230612114949_nolog_fs_obfs_armeabi_release.tbs'
				} else if (this.abiType === 2) {
					this.x5Version = 46515
					this.x5Url ='/tbs/tbs_core_046515_20230612112541_nolog_fs_obfs_arm64-v8a_release.tbs'
				} else {
					modal.toast({message: '没有符合当前手机的可用x5内核使用',duration: 4});
					return
				}
				let _this = this
				//加载本地的内核  将.tsb文件拷贝到 app-android/assets/tbs/目录下，打包自定义基座后，即可实现本地加载，
				//但是打包后apk文件会非常大，而且uniapp云打包会有大小付费限制，建议采用loadUrlX5Core网络加载
				//如果不采用本地加载向内核，一定要把assets目录整个删除，否则无法自定义打包基座，会遇到大小限制问题
				loadLocal(this.x5Version,this.x5Url,{
						onProgressUpdate(progress){
							console.log('onProgressUpdate--->',progress)
						},
						success(msg){
							console.log('success--->',msg)
							modal.toast({message: msg,duration: 2});
							_this.showRestartTip()
						},
						error(code,msg){
							console.log('error--->',code,msg)
							modal.toast({message: msg,duration: 2});
						},
						isCanLoadX5(isCan){
							console.log('isCanLoadX5--->',isCan)
						}
					}
				)
			}
		}
	}
</script>
```

[腾讯X5内核官网地址](https://x5.tencent.com/tbs/sdk.html)


## 长期维护，持续更新，提供终身免费技术支持
## 本插件已稳定运行3年，累计为20万多商户及个人提供服务，请您放心使用
