<template>
	<view>
		<web-view :webview-styles="webviewStyles" src="https://mall-uniapp-test.dmsh.cn:8081/"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				webviewStyles: {
					progress: {
						color: '#FF3333'
					}
				}
			}
		}
	}
</script>

<style>

</style>
