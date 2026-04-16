/**
 * 模块设置 API 层
 */

import axios from 'axios'

// ========== Mock 数据 ==========

const mockBasicInfo = {
  moduleName: '门店&用户测试用例',
  moduleId: 10364,
  creator: '卢波',
  creatorErp: 'lubo24',
  createdAt: '2023-05-19 10:10',
  updatedAt: '2024-07-02 16:14',
  description: '',
  approver: ''
}

const mockMembers = [
  { id: 1, name: '尚瑞敏', type: '用户', role: '成员', avatar: true },
  { id: 2, name: '李洁', type: '用户', role: '管理员', avatar: true },
  { id: 3, name: '戴宏玮', type: '用户', role: '成员', avatar: true },
  { id: 4, name: '罗蓉', type: '用户', role: '管理员', avatar: true },
  { id: 5, name: '王喆', type: '用户', role: '成员', avatar: true },
  { id: 6, name: '谭莉', type: '用户', role: '管理员', avatar: true },
  { id: 7, name: '李欣', type: '用户', role: '管理员', avatar: true },
  { id: 8, name: '曾令明', type: '用户', role: '成员', avatar: true },
  { id: 9, name: '韦海梅', type: '用户', role: '成员', avatar: true },
  { id: 10, name: '程彬彬', type: '用户', role: '成员', avatar: true },
  { id: 11, name: '杜豪', type: '用户', role: '管理员', avatar: true },
  { id: 12, name: '耿云飞', type: '用户', role: '管理员', avatar: true },
  { id: 13, name: '杨士超', type: '用户', role: '成员', avatar: true },
  { id: 14, name: '熊阳', type: '用户', role: '成员', avatar: true }
]

const mockWhitelist = [
  { id: 6568, type: 'HTTP', apiName: '/api', methodName: 'POST', expireTime: '2026-04-01', status: '已过期', creator: 'tianhuiying1', createdAt: '2026-03-26 14:27:45' },
  { id: 6867, type: 'HTTP', apiName: '/food/account/queryUserAccountDetail', methodName: 'POST', expireTime: '2026-04-16', status: '已生效', creator: 'ext.qinbo9', createdAt: '2026-04-15 23:45:01' },
  { id: 6866, type: 'HTTP', apiName: '/foodLogin/menu', methodName: 'POST', expireTime: '2026-04-16', status: '已生效', creator: 'ext.qinbo9', createdAt: '2026-04-15 23:44:25' },
  { id: 6625, type: 'HTTP', apiName: '/resource/privilege/has/resource', methodName: 'POST', expireTime: '2026-04-01', status: '已过期', creator: 'fengyiao.1', createdAt: '2026-03-30 23:30:20' },
  { id: 4827, type: 'JSF', apiName: 'com.jd.pop.order.oaid.service.IOaidService', methodName: 'getReceiverInfoList', expireTime: '2025-12-31', status: '审批中', creator: 'ext.guowujie6', createdAt: '2025-12-01 18:30:36' }
]

const mockVariables = [
  { id: 262789, name: '京明鉴权', scope: '用例维度', creator: 'fengyiao.1', desc: '' },
  { id: 255097, name: '秒送测试商家账号', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 251550, name: '供应商账号', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 248352, name: 'vender', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 18520, name: '外卖帐号', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 18462, name: '刷数', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 18043, name: '外卖子帐号同步预校验', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 12649, name: 'POP账号', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 12172, name: '用户中台', scope: '用例维度', creator: 'tianhuiying1', desc: '' },
  { id: 11065, name: '权益额度', scope: '用例维度', creator: 'cenglingming1', desc: '' }
]

const mockFunctions = [
  { id: 1, name: '1', params: '1', creator: 'ext.chenyunlei1', creatorAvatar: true, updateTime: '2026-04-16 22:30' }
]

const mockFrameworks = []

const mockFiles = []

const mockEnvs = []

const mockRecycleBins = []

const mockApiChanges = []

// ========== API 函数 ==========

export async function fetchBasicInfo(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: mockBasicInfo } }
}

export async function fetchMemberList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockMembers, total: mockMembers.length } } }
}

export async function fetchTagCategories(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: [{ id: 1, name: 'pop账号核心接口' }] } } }
}

export async function fetchTagList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: [], total: 0 } } }
}

export async function fetchWhitelistList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockWhitelist, total: mockWhitelist.length } } }
}

export async function fetchVariableList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockVariables, total: mockVariables.length } } }
}

export async function fetchFunctionList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockFunctions, total: mockFunctions.length } } }
}

export async function fetchFrameworkList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockFrameworks, total: mockFrameworks.length } } }
}

export async function fetchFileList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockFiles, total: mockFiles.length } } }
}

export async function fetchEnvList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockEnvs, total: mockEnvs.length } } }
}

export async function fetchRecycleBinList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockRecycleBins, total: mockRecycleBins.length } } }
}

export async function fetchApiChangeList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 100))
  return { data: { code: 0, data: { list: mockApiChanges, total: mockApiChanges.length } } }
}

export async function savePersonalConfig(payload = {}) {
  void payload
  await new Promise(r => setTimeout(r, 150))
  return { data: { code: 0, msg: '保存成功' } }
}
