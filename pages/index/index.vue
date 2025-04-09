<template>
  <view>
    <view class="relative">
      <wd-tabs v-model="activeTab">
        <wd-tab title="收银" name="MobilePay"><MobilePay/></wd-tab>
        <wd-tab title="测试" name="Test"><Test/></wd-tab>
        <wd-tab title="班结" name="班结"></wd-tab>
        <wd-tab title="交易速查" name="交易速查"></wd-tab>
        <wd-tab title="油品进销存" name="油品进销存"></wd-tab>
        <wd-tab title="非油品进销存" name="非油品进销存"></wd-tab>
        <wd-tab title="积分商城" name="积分商城"></wd-tab>
        <wd-tab title="设置" name="设置"></wd-tab>
      </wd-tabs>
      <view class="absolute top-0 right-40 flex" style="align-items: center; height: 42px" @click="handleLogout">
        <text>退出</text>
      </view>
    </view>

  </view>
</template>
<script setup name="PwdLogin">
import {  ref,reactive } from 'vue'
import { httpPost, httpGet } from '@/utils/http'
import { useUserStore } from '@/store'
const userStore = useUserStore()
import MobilePay from './MobilePay.vue'
import Test from './Test.vue'
// #ifdef H5
import VConsole from 'vconsole'
const vConsole = new VConsole()
// #endif
/** 当前激活的标签页 */
const activeTab = ref('MobilePay')

/** 退出登录 */
const handleLogout = () => {
  httpPost('/retail-auth-biz/api/v1/auth/user/userLogout').then((res) => {
    console.log(res);
    userStore.clearUserInfo()
    uni.reLaunch({url: '/pages/login/PwdLogin'});
    uni.showToast({icon: 'success', title: '退出登录成功'})
  }).catch((err) => {
    console.log(err);
    uni.showToast({icon: 'error', title: '退出失败'})
  })
}
</script>
<style scoped>
.content {
  line-height: 120px;
  text-align: center;
}
</style>
