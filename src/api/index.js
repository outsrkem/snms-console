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
export const GetOwnClass = (params) => ajax('/v1/class/own', 'GET', params)

// 创建班级 POST /v1/class/setting
export const CreateClass = (data) => ajax('/v1/class/setting', 'POST', null, data)


// 登记就餐数据 POST /v1/meals/record/:class_id
export const RecordMealsData = (paths, data) => ajax(`/v1/meals/record/${paths.class_id}`, 'POST', null, data)

// 查询就餐数据详情 GET /v1/meals/detail?page=3&page_size=10
export const GetMealsDetail = (paths, params) => ajax(`/v1/${paths.class_id}/meals/detail`, 'GET', params, null)


// 查询就餐报表 GET /statistics/monthly/meals/{classId}
export const GetMonthlyMeals = (paths, params) => ajax(`/v1/statistics/monthly/meals/${paths.class_id}`, 'GET', params, null)
// 查询每天所有班级的就餐统计 GET /v1/statistics/daily/meals?page=1&page_size=2&y=2024&m=9&d=25
export const GetDailyMeals = (params) => ajax('/v1/statistics/daily/meals', 'GET', params, null)
// 查询每月所有班级的就餐统计 GET /v1/statistics/monthly/meals/all?page=1&page_size=300&y=2024&m=1
export const GetMonthlyMealsAll = (params) => ajax('/v1/statistics/monthly/meals/all', 'GET', params, null)


// 查询所有教师 GET /v1/teacher/all?page=1&page_size=10
export const GetAllTeacher = (params) => ajax('/v1/teacher/all', 'GET', params, null)
// 查询所有班级 GET /v1/class/all?page=1&page_size=10
export const GetAllClass = (params) => ajax('/v1/class/all', 'GET', params, null)

// 班级添加教师 POST /v1/class/add/student
export const ClassAddTeacher = (data) => ajax('/v1/class/add/student', 'POST', null, data)

// 查询班级详情 GET /v1/classes/14e21bacf0b54d4ab58c215dde9eeccb/details
export const GetClassesDetails = (params) => ajax(`/v1/classes/details`, 'GET', params, null)
// 班级和教师解绑 DELETE /v1/classes/teacher
export const DeleteClassesTeacher = (data) => ajax('/v1/classes/teacher', 'DELETE', null, data)
