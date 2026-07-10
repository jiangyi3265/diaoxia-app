# 钓虾业务系统用户端

## 项目简介

钓虾业务系统的用户端小程序，面向消费者提供门店浏览、在线预约、商品购买、订单查询、售后、会员权益及邀请分享等服务。

## 技术栈

- Uni-app、Vue 3、Vite
- 微信小程序（mp-weixin）
- DCloud Uni 组件与跨端构建工具链

## 关联仓库

| 仓库 | 职责 | 与本仓库的关系 |
| --- | --- | --- |
| [diaoxia-backend](https://github.com/jiangyi3265/diaoxia-backend) | 后端服务 | 为本用户端提供账户、预约、订单、商城与会员 API |
| [diaoxia-admin](https://github.com/jiangyi3265/diaoxia-admin) | 管理后台 | 与本用户端共用后端数据，由运营人员维护业务内容 |
| [diaoxia-app](https://github.com/jiangyi3265/diaoxia-app) | 用户端 | 当前仓库，承载用户侧小程序体验 |

## 快速启动

```bash
npm install
npm run dev:mp-weixin
```

命令会生成微信小程序开发目录 `unpackage/dist/dev/mp-weixin`。使用微信开发者工具导入该目录，并将接口地址配置为已启动的 [diaoxia-backend](https://github.com/jiangyi3265/diaoxia-backend) 服务。构建发布包：

```bash
npm run build:mp-weixin
```

## 简历描述示例

独立开发钓虾用户端微信小程序，基于 Uni-app 与 Vue 3 实现门店展示、预约、商城下单、订单售后和会员体系，并与后台服务及运营管理端完成数据闭环。
