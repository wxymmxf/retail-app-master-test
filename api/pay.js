import { httpPost, httpGet } from '/utils/http.ts'

/**
 * 生成支付二维码
 */
export function createOrd(data) {
  return httpPost('/retail-bos-biz/api/v1/order/createOrd', data)
}
