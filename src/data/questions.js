/**
 * 50 题：36 道情境兴趣（每型 6 题，其中 1 题配图）、6 道工作条件、8 道做事方式。
 * 兴趣决定职业家族；做事方式只在同一家族里排序，不单独决定专业。
 */
import { INTEREST_CHOICES, VALUE_CHOICES } from './scale'

const INTEREST_PROMPT = '你愿意经常过这样的一段工作或上课时间吗？'
const VALUE_PROMPT = '只看这件事本身，你有多在意？'
const STYLE_PROMPT = '换成你，你更可能怎么做？'

function interest(code, text, image = '') {
  return {
    kind: 'interest',
    dimension: code,
    question_text: text,
    prompt: INTEREST_PROMPT,
    image,
    options: INTEREST_CHOICES.map((option) => ({ ...option, trait: code })),
  }
}

function value(code, text) {
  return {
    kind: 'value',
    dimension: code,
    question_text: text,
    prompt: VALUE_PROMPT,
    image: '',
    options: VALUE_CHOICES.map((option) => ({ ...option, trait: code })),
  }
}

function style(dimension, text, first, second) {
  return {
    kind: 'style',
    dimension,
    question_text: text,
    prompt: STYLE_PROMPT,
    image: '',
    options: [
      { key: 'A', text: first.text, trait: first.trait, score: 2 },
      { key: 'B', text: second.text, trait: second.trait, score: 2 },
      { key: 'C', text: '两种都可能', trait: '', score: 0 },
    ],
  }
}

const rounds = [
  [
    interest(
      'R',
      '维修车间的工作台上摆着拆开的小电机、扳手和图纸。主管让你把它装回去，并确认能转起来。',
      '/scenes/scene-r.jpg',
    ),
    interest(
      'I',
      '质检室里，电脑上的水温曲线和旁边那瓶样品测出的温度对不上。主管问你：要不要把差在哪里查出来？',
      '/scenes/scene-i.jpg',
    ),
    interest(
      'A',
      '客户要一版新品主视觉。桌上有相机、色卡和做到一半的版面，就差你把版式排到能发给对方。',
      '/scenes/scene-a.jpg',
    ),
    interest(
      'S',
      '托育机构的阅读角，一个孩子抱着绘本等你讲下一页。房间里又亮又安静。',
      '/scenes/scene-s.jpg',
    ),
    interest(
      'E',
      '品牌快闪的展台上摆着陶杯和布袋。两位顾客停下，等你讲清这两样东西的用处和差别。',
      '/scenes/scene-e.jpg',
    ),
    interest(
      'C',
      '项目资料已经按颜色分好。你正把核对过的清单放进对应的文件夹。每放对一次，这批档案就清楚一点。',
      '/scenes/scene-c.jpg',
    ),
  ],
  [
    interest('R', '产线上的数控车床突然停了，报警灯亮着。同事已经让开。检修步骤写在机床旁，扳手就在你手边。'),
    interest('I', '客户退回的手机已经打开。电池和屏幕都正常，就差主板为什么连不上。你可以对照电路说明继续查，直到能向客户解释。'),
    interest('A', '品牌要一条 15 秒的新品短视频，产品已经摆在拍摄台上。分镜你已经定了，就差现在拍出来。'),
    interest('S', '病房里一位病人还在发烧。你按护理步骤再测一次体温、观察精神，并把这次结果记进记录单。'),
    interest('E', '部门周六的招商会还没定谁负责接待、谁负责签到。大家都看向你。'),
    interest('C', '一叠供应商发票摊开，对账单上还有三笔金额没勾上。你可以逐笔对完。'),
  ],
  [
    interest('R', '试验车的仪表盘亮了发动机故障灯。你掀开机盖，就能马上动手查。'),
    interest('I', '质检记录里，同一行写着长度 160 毫米、重量 90 克，和原始测量对不上。你准备一行行找出是哪一格抄错了。'),
    interest('A', '顾客坐在镜子前，头发刚洗完，等你完成这次造型。你一上手，效果马上能看见。'),
    interest('S', '新同事对着仪器操作卡，卡在先校准还是先记读数。你刚好能坐下，把这一步做给对方看。'),
    interest('E', '门店白板上写着今天要完成 80 单。你可以去看还差多少，拉着同事把它做完。'),
    interest('C', '仓库库位 A-12 的单据写着应有 24 箱。你走到货架前，就能把实数点清楚。'),
  ],
  [
    interest('R', '设备底座已经就位，就差最后三颗螺丝。拧完，这台机器就能通电试运行。'),
    interest('I', '办公室网络的路由器指示灯一直闪红。同事说重启就行，你还想查清是网线、配置，还是设备本身的问题。'),
    interest('A', '你交出去的活动主视觉被客户退了回来，意见是标题太小、颜色太花。你想改到自己也觉得能发稿为止。'),
    interest('S', '同事的方案被否了，下班前找到你，说今天特别受挫。你可以先听完，再陪对方想明天怎么跟负责人说。'),
    interest('E', '小组打算把展位放在人流少的走廊尽头。你想到挪到大厅入口更合适，想当面说服大家就按这个改。'),
    interest('C', '新员工的入职材料从文件夹里散出来了，身份证明和照片页分了家。你可以整理到下次谁来都能立刻找到这个人。'),
  ],
  [
    interest('R', '中央厨房的案板上是处理干净的食材和菜刀。下一批要切成厚薄均匀的片，切完就能进入下一道工序。'),
    interest('I', '实验台上有三瓶水样，标签分别是自来水、循环水和雨水，旁边是比色卡。你可以对照颜色，把哪一瓶浊度更高记进记录。'),
    interest('A', '品牌橱窗空着，衣架上有三件成衣和两块色布。你可以按这次陈列方案把它们摆出来。'),
    interest('S', '政务服务窗有人来办居住登记。你可以把表格上的姓名、住址一项项讲清楚，并帮对方把空格填上。'),
    interest('E', '公司前台来了一位客户，只说要找市场部。你负责问清姓名和来意，再把人带到市场部。'),
    interest('C', '苗圃收工了，铲子和浇水壶已经归位。台账上还空着今天种下和出圃的月季数量，你要逐笔记下来。'),
  ],
  [
    interest('R', '配电箱门开着，线已经标了红、蓝、黄。你可以按图把断掉的那根接好，再看电压表读数是否正常。'),
    interest('I', '一张水泵的结构图摊开，能看见叶轮、电机和进出水口。你可以追着线条，搞清它是怎么把水送上去的。'),
    interest('A', '裁床上是一块西装面料、一套纸样和别针。你可以裁、别，看最后的肩线是不是你要的形状。'),
    interest('S', '康复训练里，一位恢复期的人要练习从椅子上站起来。你可以在旁边把发力和脚步带着做一遍，直到对方能自己完成。'),
    interest('E', '客户拿着两份方案犹豫：一份是标准服务，一份包含一年维护。你可以讲清差别，帮对方做决定。'),
    interest('C', '出库台上有八个包裹，每个贴着运单号。出库单上有八个号码。你可以逐件核对，不错一件。'),
  ],
]

const tail = [
  value('ST', '一份工作每月到点发工资，岗位也很少突然被调走。'),
  value('IN', '同样辛苦，另一家平时少一截，但做出业绩的月份奖金高很多。'),
  value('HD', '一天里大部分时间是自己动手把东西做出来，而不是坐着开会。'),
  value('HP', '下班时能清楚想起，今天具体帮到了哪一个人。'),
  value('AU', '任务交给你之后，做法和时间大体可以自己安排。'),
  value('MS', '未来几年一直把同一门技术或同一项业务做深，而不是频繁换方向。'),
  style(
    'EI',
    '明天的任务可以二选一：去人多的项目组，或者自己留在工位把今天的问题收尾。',
    { trait: 'E', text: '去人多的项目组，边做边商量' },
    { trait: 'I', text: '自己留在工位，把问题收尾' },
  ),
  style(
    'EI',
    '新同事入职，需要有人带他们熟悉工位和安全出口。',
    { trait: 'E', text: '你主动带路，一路介绍' },
    { trait: 'I', text: '你把路线和注意事项写清楚，让他们自己看' },
  ),
  style(
    'SN',
    '一台没见过的标签打印机送到工位，说明书就在旁边。',
    { trait: 'S', text: '先按第一页的步骤把它操作一遍' },
    { trait: 'N', text: '先搞清它整体是用来解决什么问题' },
  ),
  style(
    'SN',
    '你交的方案被退回，页边只有一个圈。',
    { trait: 'S', text: '先核对哪一条具体要求没达到' },
    { trait: 'N', text: '先想能不能换一种做法' },
  ),
  style(
    'TF',
    '项目做到一半，同事把一笔关键数据的单位用错了。',
    { trait: 'T', text: '直接指出错在哪，并把对的做法说清楚' },
    { trait: 'F', text: '先听对方怎么想的，再把正确步骤补上' },
  ),
  style(
    'TF',
    '负责人让你给同事的方案写一句反馈。',
    { trait: 'T', text: '主要写哪里对、哪里不对' },
    { trait: 'F', text: '主要写已经做好的地方，以及下一步怎样更顺' },
  ),
  style(
    'JP',
    '下周有一次客户拜访，集合时间和地点已经发出来了。',
    { trait: 'J', text: '提前列好要带的东西和怎么去' },
    { trait: 'P', text: '先记住地点，细节到那天再看' },
  ),
  style(
    'JP',
    '方案做到一半，你突然想到把结论放到第一页会更清楚。',
    { trait: 'J', text: '先按原计划做完，再考虑要不要改' },
    { trait: 'P', text: '马上换成新做法试试' },
  ),
]

const source = [...rounds.flat(), ...tail]

export const defaultQuestions = source.map((question, index) => ({
  id: index + 1,
  order_index: index + 1,
  section: question.kind,
  dimension: question.dimension,
  question_text: question.question_text,
  prompt: question.prompt,
  image: question.image,
  options: question.options,
}))
