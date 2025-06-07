// jieguo.js
// 【仅输出主题AI分析，不显示整体AI分析和“结果：”前缀】
// 用法：window.getTopicResult([id数组], '学业') 等

(function(){

  // 主题引言
  window.TOPIC_INTRO = {
    "事业": "【事业AI分析】",
    "情感": "【情感AI分析】",
    "学业": "【学业AI分析】",
    "健康": "【健康AI分析】",
    "财运": "【财运AI分析】",
    "其他": ""
  };

  // 主题吉凶分析
  function analyzeLuck(levelArr, total, topic){
    let up = levelArr.上签 || 0, mid = levelArr.中签 || 0, down = levelArr.下签 || 0;
    if(total === 0) return "";

    topic = (topic || "其他").trim();

    let text = "";

    // 上签为主
    if(up/total >= 0.7) switch(topic){
      case "事业": text="事业正处旺势期，宜乘势而为，勇于表达想法与挑战新任务，或可在职场有突破与晋升。"; break;
      case "情感": text="感情顺畅、温馨甜蜜，适合表白、深化关系或共创新阶段。单身者有遇良缘吉象。"; break;
      case "学业": text="学业运极佳，努力必有回报，适合考试、申请等重大事务，宜追加努力冲刺。"; break;
      case "健康": text="健康状况整体良好，适宜开展锻炼养生计划，心情舒畅，身心合一。"; break;
      case "财运": text="财运旺盛，投资理财或事业发展多有收获，但也要防过度乐观，见好就收。"; break;
      default:text="整体运势隆盛，有贵人助力与事业进步，可积极行动把握当下。"; break;
    }
    // 下签为主
    else if(down/total >= 0.5) switch(topic){
      case "事业": text="事业压力较大，易遇困阻或误解，当前不宜过于激进，宜谨慎应对、积蓄实力，耐心等时。"; break;
      case "情感": text="情感易有波动、猜疑或短暂失和，不宜急进，需多些理解和包容，守静为好。"; break;
      case "学业": text="学业上易感迷茫或成绩波动，可能遇挑战，应调整状态，向师长请教，稳扎稳打。"; break;
      case "健康": text="健康方面需格外重视，警惕旧疾复发或体力透支，作息合理，凡事留意身体信号。"; break;
      case "财运": text="财务警讯显现，投资合作需仔细甄别，避免冒险。宜保守理财、防止意外损失。"; break;
      default: text="时运低迷，凡事宜低调谨慎，多沉淀自己，耐心等待转机。"; break;
    }
    // 中签为主
    else if(mid/total >= 0.5) switch(topic){
      case "事业": text="事业处于平稳阶段，此时宜脚踏实地进行巩固，不宜急功近利，耐心等待成长机会。"; break;
      case "情感": text="情感平和可喜，或有小波澜但无大碍，宜珍惜沟通，维护好现有关系。"; break;
      case "学业": text="学业发展逐步提升，实力稳步增加，静心温习可获进步。"; break;
      case "健康": text="身体状况总体无大碍，维持良好习惯，定期自查防患未然。"; break;
      case "财运": text="财运平顺，可做适度理财与储蓄规划，重大决策需谨慎评估。"; break;
      default: text="整体运势平稳，日常事务都有序进行，可根据实际调整节奏。"; break;
    }
    // 上签略多
    else if(up>down) switch(topic){
      case "事业": text="事业有突破迹象，谨慎把握机会，切忌骄躁，稳中求胜利。"; break;
      case "情感": text="感情发展向好，可尝试进一步沟通交流，善用时机。"; break;
      case "学业": text="具备良好基础，如再加专注定有佳绩，勿松懈。"; break;
      case "健康": text="整体健康趋势向上，小毛病可自愈，养成好习惯更有益。"; break;
      case "财运": text="财运渐开，适合小额投资及积累，勿妄求速富。"; break;
      default: text="渐入佳境，诸事宜积极，但切勿掉以轻心。"; break;
    }
    // 下签略多
    else if(down>up) switch(topic){
      case "事业": text="事业上易有阻滞，近期宜谨小慎微，多做准备以防不测。"; break;
      case "情感": text="感情层面小挫不断，执着过甚易生烦恼，宜自省、宽容。"; break;
      case "学业": text="学习遇到瓶颈，需要及时调整方法、主动反思。"; break;
      case "健康": text="健康需注意细节，调整饮食作息防微杜渐。"; break;
      case "财运": text="财务方面防小额损失，投资须谨慎。"; break;
      default: text="宜察觉风险，调整步伐，先稳后图进展。"; break;
    }
    // 吉凶平衡
    else text = "吉凶参半，万事顺势而为，无需强求。以平和之心面对得失，灵活应对方为正道。";

    return text;
  }

  // 随机取一条签诗作参考
  function getRandomPoem(signArr){
    let hasPoemArr = signArr.filter(s=>!!s.poem);
    if(hasPoemArr.length===0) return '';
    let pick = hasPoemArr[Math.floor(Math.random()*hasPoemArr.length)];
    let poem = pick.poem.split(/；|\n/)[0];
    return poem ? `【签中诗】${poem}` : '';
  }

  // 核心AI分析函数
  function summarizeDraw(ids, topic) {
    topic = ((topic||"其他") + "").trim();
    let signArr = ids.map(id=>window.SIGNS.find(s=>s.id === id)).filter(Boolean);
    let total = signArr.length;
    if(total===0) return (window.TOPIC_INTRO[topic]||"") + "未抽中任何签，请再次试试。";

    // 统计等级
    let levelArr = { 上签:0, 中签:0, 下签:0 };
    signArr.forEach(s => {
      if(s.level==="上签") levelArr.上签++;
      else if(s.level==="中签") levelArr.中签++;
      else levelArr.下签++;
    });

    let intro = window.TOPIC_INTRO[topic] || window.TOPIC_INTRO["其他"];
    let luckTips = analyzeLuck(levelArr, total, topic);
    let poem = getRandomPoem(signArr);

    // 只输出主题AI分析（intro+luckTips），如有签诗则拼接
    return `${intro}${luckTips}${poem?(' '+poem):''}`;
  }

  // 仅暴露一个主题AI分析API
  window.summarizeDraw = summarizeDraw;
  window.getTopicResult = function(ids, topic) {
    return summarizeDraw(ids, topic);
  };

})();
