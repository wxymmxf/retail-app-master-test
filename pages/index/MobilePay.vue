<template>
  <view>
    <wd-row :gutter="20">
      <wd-col :span="4"><view class="bg-dark">油枪列表</view></wd-col>
      <wd-col :span="11">
        <wd-table :data="dataList">
          <wd-table-col prop="prodName" label="品名" width="25%"></wd-table-col>
          <wd-table-col prop="count" label="数量" width="25%"></wd-table-col>
          <wd-table-col prop="price" label="单价" width="25%"></wd-table-col>
          <wd-table-col prop="totalAmt" label="小计" width="25%"></wd-table-col>
        </wd-table>
      </wd-col>
      <wd-col :span="9">
        <wd-table :data="orderTotal">
          <wd-table-col prop="column1" label="订单总额" width="25%"></wd-table-col>
          <wd-table-col prop="column2" label="优惠券折扣" width="25%"></wd-table-col>
          <wd-table-col prop="column3" label="立减" width="25%"></wd-table-col>
          <wd-table-col prop="column4" label="应收总额" width="25%"></wd-table-col>
        </wd-table>
        <view>
          <view>实付：200.00</view>
          <view>订单号：{{orderInfo.orderNo}}</view>
          <view>qrCodekey：{{orderInfo.qrCodekey}}</view>
        </view>
        <wd-tabbar v-model="tabbar">
          <wd-tabbar-item name="home" title="现金" icon="home"></wd-tabbar-item>
          <wd-tabbar-item name="cart" title="会员卡" icon="cart"></wd-tabbar-item>
          <wd-tabbar-item name="setting" title="银行卡" icon="setting"></wd-tabbar-item>
          <wd-tabbar-item name="user" title="移动支付" icon="user" @click="mobilePay"></wd-tabbar-item>
          <wd-tabbar-item name="photo" title="混合支付" icon="photo"></wd-tabbar-item>
          <wd-tabbar-item name="chat" title="更多" icon="chat"></wd-tabbar-item>
        </wd-tabbar>
        <wd-img :width="200" :height="200" :src="mobilePayUrl" @click="refreshQRCode"/>
      </wd-col>
    </wd-row>
    <wd-button @click="mobilePay">移动支付Mock数据</wd-button>
  </view>
</template>
<script setup name="MobilePay">
import { ref,reactive } from 'vue'
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { httpPost } from '@/utils/http'
import { mobilePayJson } from '@/mock/mobilePay'
import { createOrdJson } from '@/mock/createOrd'
// import { createOrd } from '@/api/pay'
/** 支付方式 */
const tabbar = ref('') //
/** 移动支付二维码Url */
const mobilePayUrl = ref('')
/** 订单状态轮询标识 */
const orderStatusPollingFlag = ref(true)
/** 订单状态轮询 */
const orderStatusPollingInterval = ref(null)

/** 订单信息 */
const orderInfo = ref({
  orderNo: '',
  qrCodekey: ''
})
/**
 * 生成支付二维码
 */
const mobilePay = () => {
  // httpPost('https://retail-api-dev.dmsh.cn:8081/retail-bos-biz/api/v1/selectpayment/mobilePay', mobilePayJson).then((res) => {
  httpPost('/retail-bos-biz/api/v1/order/createOrd', createOrdJson).then((res) => {
    console.log('生成支付二维码接口成功', res)
    orderInfo.value.orderNo = res.data.orderNo
    orderInfo.value.qrCodekey = res.data.mobilePay.qrCodekey
    mobilePayUrl.value = res.data.mobilePay.base64Image
    orderStatusPollingFlag.value = true; // 开始轮询订单状态
  }).catch((err) => {
    console.log('生成支付二维码接口异常', err)
    mobilePayUrl.value = ''
  })
}
/**
 * 刷新二维码
 */
const refreshQRCode = () => {
  let params = {
    "orderNo": orderInfo.value.orderNo
  }
  httpPost('/retail-bos-biz/api/v1/order/refreshQRCode', params).then((res) => {
    console.log('刷新二维码接口成功', res)
    mobilePayUrl.value = res.data.base64Image
    orderInfo.value.qrCodekey = res.data.qrCodekey
    orderStatusPollingFlag.value = true; // 开始轮询订单状态
  }).catch((err) => {
    console.log('刷新二维码接口异常', err)
  })
}
/**
 * 查询订单状态
 */
const queryOrderStatus = () => {
  if (!orderInfo.value.orderNo) return;
  let params = {
    "orderNo": orderInfo.value.orderNo
  }
  httpPost('/retail-bos-biz/api/v1/order/queryStatus', params).then((res) => {
    console.log('查询订单状态接口成功', res)
    if(res && "1" === res.data.status){
      console.log("订单已付款停止查询");
      // 设置轮询标识为false，停止查询订单状态
      orderStatusPollingFlag.value = false;
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      // 打印支付小票
    }
  }).catch((err) => {
    console.log('查询订单状态接口异常', err)
  })
}
const dataList = reactive([
  {
    prodName: '鲁昌2.0',
    count: '5.00',
    price: '100.00',
    totalAmt: '500.00'
  },
  {
    prodName: '非油品A',
    count: '5.00',
    price: '100.00',
    totalAmt: '500.00'
  }
])
const orderTotal = ref([{
  column1: '200.00',
  column2: '-0.00',
  column3: '',
  column4: '200.00'
}])
onLoad(() => {
  // 设置轮询间隔时间，每隔2秒查询一次订单状态
  orderStatusPollingInterval.value = setInterval(() => {
    if(orderStatusPollingFlag.value){
      queryOrderStatus()
    }
  }, 2000)
})
onUnload(() => {
  clearInterval(orderStatusPollingInterval.value)
})
</script>
