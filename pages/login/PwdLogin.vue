<template>
  <view style="display: flex; justify-content: center;">
    <wd-form ref="form" :model="model" style="width: 400px">
      <wd-cell-group border>
        <wd-input
            label="账号"
            label-width="100px"
            prop="account"
            clearable
            v-model="model.account"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请填写账号' }]"
        />
        <wd-input
            label="密码"
            label-width="100px"
            prop="password"
            show-password
            clearable
            v-model="model.password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
        />
      </wd-cell-group>
      <view class="footer">
        <wd-button type="primary" size="large" @click="handleSubmit" block>提交</wd-button>
      </view>
    </wd-form>
  </view>
</template>
<script setup name="LoginIndex">
import { ref } from 'vue'
import { httpPost, httpGet } from '@/utils/http'
import { useUserStore } from '@/store'
const userStore = useUserStore()

const model = ref({
  account: 'admin',
  password: '123456'
})
const handleSubmit = () => {
  console.log(model.value)
  httpPost(
      '/retail-auth-biz/api/v1/auth/user/userLogin',
      model.value,
      null,
      {clientid: 'pad_h5'}
  ).then((res) => {
    console.log(res);
    userStore.setUserInfo({
      id: res.data?.id,
      nickname: res.data?.nickname,
      remark: res.data?.remark,
      username: res.data?.username,
      avatar: res.data?.avatar,
      token: res.data?.accessToken,
      refreshToken: res.data?.refreshToken,
      expiresTime: res.data?.expiresTime
    })
    uni.showToast({icon: 'success', title: '登录成功'})
    uni.navigateTo({url: '/pages/index/Index'});
  }).catch((err) => {
    console.log(err);
    uni.showToast({icon: 'error', title: '登录失败'})
  })
}
</script>
