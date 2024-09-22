/*
 * 与后台交互模块 （依赖已封装的ajax函数）
 * 包含n个接口请求函数的模块，函数的返回值是promise对象
 */
import ajax from '../api/ajax'
/**
 * ajax 有如下4个参数
 * @param {*} url 请求路径，默认为空
 * @param {*} method 请求方法，默认为GET
 * @param {*} params 请求参数，默认为空对象
 * @param {*} data 请求参数，默认为空对象
 */

// export const logout = () => ajax('/v1/user/logout', 'POST')
// export const basicInfo = () => ajax('/v1/uias/user/basicInfo', 'GET', null, null)

// // 获取账号
// export const GetAccount = (params) => ajax('/v1/uias/user/center/account', 'GET', params, null)
export const Resume = () => ajax('/v1/resume', 'POST')

// 查询我的班级 /v1/class/own GET
export const GetOwnClass = () => ajax('/v1/class/own', 'GET')

// 登记就餐数据 POST /v1/meals/record/:class_id
export const RecordMealsData = (paths, data) => ajax(`/v1/meals/record/${paths.class_id}`, 'POST', null, data)

// 查询就餐数据详情 GET /v1/meals/detail?page=3&page_size=10
export const GetMealsDetail = (paths, params) => ajax(`/v1//${paths.class_id}/meals/detail`, 'GET', params, null)


// 查询就餐报表 GET /v1/meals/report?cid=14e21bacf0b54d4ab58c215dde9eeccb&y=2024&m=09
export const GetMealsReport = (params) => ajax('/v1/meals/report', 'GET', params, null)
