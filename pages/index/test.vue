<template>
    <view style="display: flex;margin:10px;flex-direction: column;">
        <view style="margin-top: 10px;">
            <button @click="showSubScreen()">显示副屏</button>
        </view>
        <view style="margin-top: 10px;">
            <button @click="sendDataToSubScreen()">向副屏发送消息</button>
        </view>
        <view style="margin-top: 10px;">
            <button @click="loadSubScreenUrl()">设置副屏URL</button>
        </view>
        <view style="margin-top: 10px;">
            <button @click="closeSubScreen()">关闭副屏</button>
        </view>
        <view style="margin-top: 10px;">副屏发来的消息:</view>
        <view>{{msg}}</view>
		<!-- X5内核验证 -->
		<view style="display: flex;margin:10px;flex-direction: column;">
			<view><text style="font-weight: bold;">浏览器内核：</text>{{userAgent}}</view>
			<view><text style="font-weight: bold;">系统CPU架构：</text>{{supportedAbis}}</view>
			<view><text style="font-weight: bold;">系统版本：</text>{{osName}}</view>
			<view><text style="font-weight: bold;">x5版本号：</text>{{x5Version}}</view>
			<view><text style="font-weight: bold;">x5下载地址：</text>{{x5Url}}</view>
			<view><text style="font-weight: bold;">x5下载进度：</text>{{x5Progress}}</view>
			<view style="margin-top: 10px;">
				<button type="default" @click="toWebView()">跳转到WebView页面测试</button>
			</view>
			<view style="margin-top: 10px;">
				<button type="default" @click="canLoadX5Core()">验证x5内核是否存在并可用</button>
			</view>
			<view style="margin-top: 10px;">
				<button type="default" @click="loadUrlX5Core()" :loading="isLoading" :disabled="isLoading">加载远程X5内核</button>
			</view>
			<view style="margin-top: 10px;">
				<button type="default" @click="loadLocalX5Core()">加载本地X5内核</button>
			</view>
		</view>
		<view style="display: flex;margin:10px;flex-direction: column;">
			<view class="text-area">
				<text class="title">{{title}}</text>
			</view>
			<button @click="handleStartScan()" style="width:100%">开启扫码</button>
			<button @click="handleStopScan()" style="width:100%">关闭扫码</button>
			<view>扫码内容：{{scanContent}}</view>
		</view>
    </view>
</template>
<script>
// X5验证
import { loadUrl , loadLocal,checkAbiType,canLoadX5 } from "@/uni_modules/tbs-x5webview";
const modal = uni.requireNativePlugin('modal');
// 副屏插件
const presentation = uni.requireNativePlugin('uniplugin-presentation');
// 扫码插件
var scanCodeModule = uni.requireNativePlugin("zq-scancode-module")
export default {
    data() {
        return {
            msg:'',
			userAgent: '',//浏览器版本
			supportedAbis: '',//手机支持的cpu架构
			abiType: '',//架构类型 1-arm32位 2-arm64位  3-其他
			json: {}, //设备信息
			osName:'',//系统名称和版本
			x5Version: '',//加载的x5版本
			x5Url: '',//加载的x5地址
			x5Progress:0,//网络加载进度
			isLoading:false,//是否正在下载中
			title: 'zq-scancode插件',
			scanContent: ''
        }
    },  
    created() {
		this.userAgent = plus.navigator.getUserAgent()
		this.osName = plus.os.name + plus.os.version
		this.json = uni.getSystemInfoSync()
		this.checkSupportedAbis()
        //功能1：接受副屏幕发来的消息
		let _this = this
        plus.globalEvent.addEventListener('SubScreenEvent', function(e){
            _this.msg = JSON.stringify(e)
        });
    },
	onUnload() {
	  // clearInterval(this.scanInterval);
	},
	onLoad() {
		// this.scanInterval = setInterval(() => {
		//     this.handleStartScan()
		//   }, 1000); // 200ms轮询间隔
	},
    methods: {
        //功能2：打开分屏页面   
        showSubScreen(){
            // presentation.show('http://www.163.com');
			// presentation.show('http://192.168.3.85:9000/unibest/index.html')
			// presentation.show('https://retail-h5-cust-dev.dmsh.cn:8081');
			// presentation.show('https://mall-uniapp-test.dmsh.cn:8081/index.html')
			// presentation.show('https://saas-camp.mvmyun.com/h5/test1.html')
			// presentation.show('https://mall-uniapp-test.dmsh.cn:8081/index.html')
			// presentation.show('https://h5.dmshec.com/index.html')
			presentation.show('https://retail-h5-cust-dev.dmsh.cn:8081')
			
        },
        //功能3：加载地址
        loadSubScreenUrl(){         
            // presentation.loadUrl('http://www.163.com')//加载网络地址  
            // presentation.loadUrl('file:///android_asset/apps/__UNI__2251100/www/static/test.html')//加载本地地址
			// presentation.loadUrl('https://mall-uniapp-test.dmsh.cn:8081/index.html')//加载网络地址  
			// presentation.loadUrl('https://h5.dmshec.com/index.html')
			presentation.show('https://saas-camp.mvmyun.com/h5/test1.html')
			// presentation.loadUrl('http://192.168.3.85:9000')
        },
        //功能4：关闭分屏页面 
        closeSubScreen(){
            presentation.close();
        },  
        //功能5：向副屏发送消息 
        sendDataToSubScreen(){
            let json={state:"主屏消息",data:'你好！'}
            presentation.sendDataToSubScreen(json);
        },
		// X5验证
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
					Update(progress){
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
					Update(progress){
						console.log('Update--->',progress)
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
		},
		handleStartScan(){
			scanCodeModule.startScan({
			    'name': '扫码',
			    'showTip': true, // 是否展示提示文字
			    'showLoading': true, // 是否展示 loading
			    'tip': "自定义扫码",
			    'tipSize': 20,
			    'tipColor': "#FF0000",
			    'transparentBg': true,
			    'onceScan': false,
			    'isDebug':true
			},
			(ret) => {
			    console.log("扫码内容：" + JSON.stringify(ret))
				this.scanContent = ret.data
			});
		},
		handleStopScan(){
			console.log("handleStopScan")
			scanCodeModule.stopScan({
			    'name': '停止扫码'
			},
			(ret) => {
			  console.log("返回内容：" + ret)
			});
		}
    }
}
</script>