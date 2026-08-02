/**
 * 默认题库：16 题，每维度 4 题
 * options[].trait 为该选项对应的维度字母
 */
export const defaultQuestions = [
  {
    id: 1,
    question_text: '周末你更愿意怎么度过？',
    dimension: 'EI',
    order_index: 1,
    options: [
      { key: 'A', text: '约朋友出去玩，人多热闹', trait: 'E' },
      { key: 'B', text: '一个人宅家看书/打游戏', trait: 'I' },
      { key: 'C', text: '参加兴趣小组或社团活动', trait: 'E' },
      { key: 'D', text: '和家人一起安静待着', trait: 'I' },
    ],
  },
  {
    id: 2,
    question_text: '在团队项目中，你通常：',
    dimension: 'EI',
    order_index: 2,
    options: [
      { key: 'A', text: '主动发言，引导讨论', trait: 'E' },
      { key: 'B', text: '倾听为主，偶尔发言', trait: 'I' },
      { key: 'C', text: '负责执行，不太参与讨论', trait: 'I' },
      { key: 'D', text: '积极协调各方意见', trait: 'E' },
    ],
  },
  {
    id: 3,
    question_text: '你更讨厌以下哪种情况？',
    dimension: 'EI',
    order_index: 3,
    options: [
      // 讨厌独处 → 外向；讨厌当众表达 → 内向（按情境语义计分）
      { key: 'A', text: '一个人吃饭/逛街', trait: 'E' },
      { key: 'B', text: '需要当众演讲', trait: 'I' },
      { key: 'C', text: '被很多人围着问问题', trait: 'I' },
      { key: 'D', text: '没人理你', trait: 'E' },
    ],
  },
  {
    id: 4,
    question_text: '对于交朋友，你的态度是：',
    dimension: 'EI',
    order_index: 4,
    options: [
      { key: 'A', text: '朋友越多越好', trait: 'E' },
      { key: 'B', text: '有几个知心的就够了', trait: 'I' },
      { key: 'C', text: '看缘分，不强求', trait: 'I' },
      { key: 'D', text: '喜欢主动认识新朋友', trait: 'E' },
    ],
  },
  {
    id: 5,
    question_text: '你更容易被什么吸引？',
    dimension: 'SN',
    order_index: 5,
    options: [
      { key: 'A', text: '眼前能看到的具体事物', trait: 'S' },
      { key: 'B', text: '天马行空的创意和想法', trait: 'N' },
      { key: 'C', text: '实用的工具和技巧', trait: 'S' },
      { key: 'D', text: '未来的可能性', trait: 'N' },
    ],
  },
  {
    id: 6,
    question_text: '看一张抽象画时，你更关注：',
    dimension: 'SN',
    order_index: 6,
    options: [
      { key: 'A', text: '用了什么颜色和线条', trait: 'S' },
      { key: 'B', text: '画家想表达什么情感', trait: 'N' },
      { key: 'C', text: '这幅画值多少钱', trait: 'S' },
      { key: 'D', text: '它让我想到什么故事', trait: 'N' },
    ],
  },
  {
    id: 7,
    question_text: '学习新知识时，你更喜欢：',
    dimension: 'SN',
    order_index: 7,
    options: [
      { key: 'A', text: '按步骤一步步来', trait: 'S' },
      { key: 'B', text: '先了解整体框架', trait: 'N' },
      { key: 'C', text: '动手实操试试', trait: 'S' },
      { key: 'D', text: '思考背后的原理', trait: 'N' },
    ],
  },
  {
    id: 8,
    question_text: '你更擅长：',
    dimension: 'SN',
    order_index: 8,
    options: [
      { key: 'A', text: '记住细节和事实', trait: 'S' },
      { key: 'B', text: '联想和想象', trait: 'N' },
      { key: 'C', text: '处理眼前的任务', trait: 'S' },
      { key: 'D', text: '规划未来', trait: 'N' },
    ],
  },
  {
    id: 9,
    question_text: '做决定时，你更依赖：',
    dimension: 'TF',
    order_index: 9,
    options: [
      { key: 'A', text: '逻辑分析和数据', trait: 'T' },
      { key: 'B', text: '感觉和直觉', trait: 'F' },
      { key: 'C', text: '听取他人意见', trait: 'F' },
      { key: 'D', text: '利弊权衡', trait: 'T' },
    ],
  },
  {
    id: 10,
    question_text: '朋友遇到困难找你倾诉，你会：',
    dimension: 'TF',
    order_index: 10,
    options: [
      { key: 'A', text: '帮他分析原因，给出解决方案', trait: 'T' },
      { key: 'B', text: '安慰他，陪伴他', trait: 'F' },
      { key: 'C', text: '先共情，再给建议', trait: 'F' },
      { key: 'D', text: '理性指出他的问题', trait: 'T' },
    ],
  },
  {
    id: 11,
    question_text: '你更认可哪种评价？',
    dimension: 'TF',
    order_index: 11,
    options: [
      { key: 'A', text: '“你的逻辑很清晰”', trait: 'T' },
      { key: 'B', text: '“你很有同理心”', trait: 'F' },
      { key: 'C', text: '“你很靠谱”', trait: 'T' },
      { key: 'D', text: '“你人缘很好”', trait: 'F' },
    ],
  },
  {
    id: 12,
    question_text: '被批评时，你更在意：',
    dimension: 'TF',
    order_index: 12,
    options: [
      { key: 'A', text: '批评的内容是否有道理', trait: 'T' },
      { key: 'B', text: '批评者的态度是否友善', trait: 'F' },
      { key: 'C', text: '是否伤害了自尊心', trait: 'F' },
      { key: 'D', text: '是否指出了真正的问题', trait: 'T' },
    ],
  },
  {
    id: 13,
    question_text: '对于旅行，你更喜欢：',
    dimension: 'JP',
    order_index: 13,
    options: [
      { key: 'A', text: '做好详细攻略再出发', trait: 'J' },
      { key: 'B', text: '走到哪玩到哪，随性探索', trait: 'P' },
      { key: 'C', text: '只定大方向，细节随机', trait: 'P' },
      { key: 'D', text: '按计划严格执行', trait: 'J' },
    ],
  },
  {
    id: 14,
    question_text: '你的桌面/房间通常是：',
    dimension: 'JP',
    order_index: 14,
    options: [
      { key: 'A', text: '整洁有序，每样东西都有固定位置', trait: 'J' },
      { key: 'B', text: '随意摆放，但自己能找到', trait: 'P' },
      { key: 'C', text: '乱中有序', trait: 'P' },
      { key: 'D', text: '定期整理，保持清爽', trait: 'J' },
    ],
  },
  {
    id: 15,
    question_text: '面对截止日期，你通常：',
    dimension: 'JP',
    order_index: 15,
    options: [
      { key: 'A', text: '提前完成，留出缓冲时间', trait: 'J' },
      { key: 'B', text: '最后时刻冲刺完成', trait: 'P' },
      { key: 'C', text: '按计划每天完成一部分', trait: 'J' },
      { key: 'D', text: '看心情，有时早有时晚', trait: 'P' },
    ],
  },
  {
    id: 16,
    question_text: '你更讨厌：',
    dimension: 'JP',
    order_index: 16,
    options: [
      { key: 'A', text: '计划被打乱', trait: 'J' },
      { key: 'B', text: '被规则束缚', trait: 'P' },
      { key: 'C', text: '事情没按预期发展', trait: 'J' },
      { key: 'D', text: '必须按部就班', trait: 'P' },
    ],
  },
]
