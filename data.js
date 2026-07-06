"use strict";
// ════════ 线路定义 ════════
// open: 是否已通车  year: 预计通车  dash: 虚线  w: 线宽档 (2粗=地铁/城铁主干 1=轻轨)
const LINES = {
  M1:  { name:"M1 地铁 西北 & 城市线", color:"#168388", open:true },
  MSW: { name:"M1 地铁 西南延伸段（巴士替代改造中）", color:"#ef7bb1", open:false, year:"2026", note:"悉登汉姆—宾士镇改造中，预计 2026 年通车" },
  MA:  { name:"西悉尼机场线", color:"#9fa0a6", open:false, year:"2027", note:"配合西悉尼国际机场启用，预计 2027 年" },
  MW:  { name:"Metro West", color:"#9fa0a6", open:false, year:"2032", note:"帕拉马塔—CBD 快线，预计 2032 年" },
  T1:  { name:"T1 北岸 & 西线", color:"#f99d1c", open:true },
  T2:  { name:"T2 莱平顿 & 内西线", color:"#0098cd", open:true },
  T3:  { name:"T3 利物浦 & 内西线", color:"#f37021", open:true },
  T4:  { name:"T4 东区 & 伊拉瓦拉线", color:"#005aa3", open:true },
  T5:  { name:"T5 坎伯兰线", color:"#c4258f", open:true },
  T6:  { name:"T6 利德科姆 & 宾士镇线", color:"#92500f", open:true },
  T7:  { name:"T7 奥林匹克公园线", color:"#6f818e", open:true },
  T8:  { name:"T8 机场 & 南线", color:"#00954c", open:true },
  T9:  { name:"T9 北方线", color:"#d11f2f", open:true },
  L1:  { name:"L1 达利奇山轻轨", color:"#be1622", open:true, lr:true },
  L2:  { name:"L2 兰德威克轻轨", color:"#dd1e25", open:true, lr:true },
  L3:  { name:"L3 金斯福德轻轨", color:"#781140", open:true, lr:true },
  L4:  { name:"L4 帕拉马塔轻轨", color:"#d6467e", open:true, lr:true },
};
// 几何路线 → 显示用线路 key 的映射（T1R 里士满支线画成 T1 色等）
const ROUTE_LINE = { T1R:"T1", T4W:"T4", CC:"T2" };
// 平行走廊错位偏移（概示图坐标系；同走廊线路呈东京式并行条带）
const ROUTE_OFF = { T1:[0,-5], T2:[0,-1.7], T3:[2.2,1.7], T5:[-2.2,5],
                    T6:[-2.6,-2.2], T1R:[0,0], T9:[0,0], CC:[0,-1.7], L3:[2.5,0] };

// ════════ 行政区(Council)数据 ════════
// v/p: BOCSAR 暴力/财产类案件率(每10万人, 2025.4–2026.3约值)  income: 家庭周收入中位数
// edu: 本科以上%  rates: 平均住宅市政费(年,约值)  mh/mu: 房价中位数 独立屋/公寓(千澳元,约值)
const NSW_AVG = { v:1166, p:1606 };
const LGAS = {
  hills:      { name:"The Hills Shire 山区", v:414, p:662, income:2831, edu:40.5, rates:1200, mh:2500, mu:870,
    eth:"英格兰裔 22.6% · 澳洲裔 22.0% · 华裔 14.7% · 印度裔 9.1%", lang:"普通话 8.2% · 粤语 3.4% · 印地语 2.8%", y:4.6, sch:"Baulkham Hills HS(精英)领衔,Castle Hill/Cherrybrook Tech 等口碑公校,教育氛围浓" },
  blacktown:  { name:"Blacktown 布莱克敦", v:1295, p:1402, income:2107, edu:29.2, rates:1400, mh:1150, mu:700,
    eth:"澳洲裔 19.1% · 英格兰裔 16.8% · 印度裔 13.5% · 菲律宾裔 9.0%", lang:"旁遮普语 5.2% · 印地语 4.4% · 他加禄语 3.8%", y:5.2, sch:"公校整体中游,Girraween HS(精英)在东南角;新区依赖新建校" },
  hornsby:    { name:"Hornsby 霍恩斯比", v:380, p:900, income:2364, edu:47.2, rates:1350, mh:1900, mu:850,
    eth:"英格兰裔 24.1% · 澳洲裔 19.6% · 华裔 15.6% · 印度裔 5.3%", lang:"普通话 8.7% · 粤语 4.6% · 印地语 2.1%", y:4.4, sch:"Hornsby Girls(精英)+Normanhurst Boys(精英),北岸学区带北端" },
  kuringgai:  { name:"Ku-ring-gai 库灵盖", v:250, p:850, income:3186, edu:60.2, rates:1650, mh:3300, mu:1250,
    eth:"英格兰裔 27.3% · 澳洲裔 20.4% · 华裔 14.5% · 爱尔兰裔 9.8%", lang:"普通话 8.4% · 粤语 4.4% · 韩语 2.5%", y:3.9, sch:"全悉尼公校天花板带:Killara/Turramurra/St Ives HS,私校云集" },
  hawkesbury: { name:"Hawkesbury 豪克斯伯里", v:880, p:1100, income:1786, edu:17.5, rates:1450, mh:1050, mu:650,
    eth:"澳洲裔 34.2% · 英格兰裔 31.8% · 爱尔兰裔 9.9%", lang:"以英语为主 · 外语使用比例低", y:4.6, sch:"乡镇公校为主,无精英中学" },
  penrith:    { name:"Penrith 彭里斯", v:1417, p:1921, income:1903, edu:17.3, rates:1500, mh:1000, mu:620,
    eth:"澳洲裔 33.3% · 英格兰裔 30.2% · 原住民 4.6%", lang:"阿拉伯语 1.8% · 旁遮普语 1.4% · 他加禄语 1.2%", y:5.0, sch:"Penrith HS(精英);其余公校一般" },
  parramatta: { name:"City of Parramatta 帕拉马塔市", v:934, p:1953, income:2051, edu:44.2, rates:1100, mh:1550, mu:700,
    eth:"华裔 22.3% · 英格兰裔 14.4% · 澳洲裔 13.9% · 印度裔 11.2%", lang:"普通话 12.4% · 粤语 6.4% · 韩语 5.5%", y:5.0, sch:"James Ruse(全州第一,在Carlingford)+Epping 学区;华人重教育核心区" },
  cumberland: { name:"Cumberland 坎伯兰", v:1100, p:1300, income:1668, edu:28.4, rates:1050, mh:1250, mu:560,
    eth:"黎巴嫩裔 10.2% · 印度裔 10.0% · 华裔 9.1% · 澳洲裔 8.9%", lang:"阿拉伯语 10.4% · 普通话 5.6% · 粤语 3.4%", y:5.3, sch:"公校一般;Girraween 精英中学在 Pendle Hill 旁" },
  ryde:       { name:"City of Ryde 莱德市", v:565, p:1223, income:2098, edu:46.4, rates:1250, mh:2400, mu:850,
    eth:"华裔 26.1% · 英格兰裔 16.9% · 澳洲裔 16.1%", lang:"普通话 13.8% · 粤语 7.2% · 韩语 4.5%", y:4.8, sch:"Eastwood/Denistone 学区热区+Ryde Secondary;近麦考瑞大学" },
  willoughby: { name:"Willoughby 韦洛比", v:571, p:1482, income:2556, edu:53.1, rates:1400, mh:3600, mu:1150,
    eth:"华裔 26.5% · 英格兰裔 23.5% · 澳洲裔 20.0%", lang:"普通话 12.9% · 粤语 7.8% · 日语 2.4%", y:4.4, sch:"Chatswood HS 口碑强,补习与私校生态成熟" },
  northsyd:   { name:"North Sydney 北悉尼", v:454, p:1040, income:2524, edu:59.5, rates:950, mh:3400, mu:1250,
    eth:"英格兰裔 33.6% · 澳洲裔 22.9% · 爱尔兰裔 12.9% · 华裔 10.8%", lang:"普通话 4.3% · 粤语 2.7% · 西班牙语 1.6%", y:4.6, sch:"North Sydney Boys/Girls 双精英,全州顶级学区标签" },
  sydney:     { name:"City of Sydney 悉尼市", v:null, p:null, income:2212, edu:52.6, rates:850, mh:2000, mu:1050,
    vNote:"案件总量居全州前列，但通勤/游客人口庞大，BOCSAR 不计算比率；CBD 及夜间娱乐区需保持留意",
    eth:"英格兰裔 25.1% · 澳洲裔 16.8% · 华裔 16.8%", lang:"普通话 8.6% · 粤语 2.8% · 泰语 2.8%", y:5.0, sch:"Sydney Boys/Girls(Moore Park)辐射;市区多私校;公寓客学区权重低" },
  innerwest:  { name:"Inner West 内西区议会", v:870, p:1608, income:2340, edu:48.2, rates:1600, mh:2300, mu:950,
    eth:"英格兰裔 29.9% · 澳洲裔 24.4% · 爱尔兰裔 13.7% · 华裔 8.5%", lang:"普通话 3.3% · 希腊语 2.7% · 意大利语 2.2%", y:4.3, sch:"Fort Street HS(精英,全州最老)+Newtown 艺术高中;小学口碑普遍不错" },
  canadabay:  { name:"City of Canada Bay 加拿大湾市", v:569, p:1224, income:2371, edu:42.9, rates:1300, mh:2900, mu:1050,
    eth:"英格兰裔 19.0% · 澳洲裔 17.6% · 华裔 16.2% · 意大利裔 15.2%", lang:"普通话 8.6% · 意大利语 6.0% · 粤语 3.9%", y:4.4, sch:"Concord HS 口碑稳;近 Strathfield 私校带" },
  burwood:    { name:"Burwood 宝活", v:953, p:2111, income:1867, edu:37.8, rates:1150, mh:2600, mu:850,
    eth:"华裔 32.8% · 英格兰裔 10.7% · 尼泊尔裔 7.4% · 意大利裔 7.3%", lang:"普通话 19.9% · 粤语 8.2% · 尼泊尔语 7.3%", y:4.8, sch:"PLC/MLC 老牌私校;Burwood Girls HS 口碑" },
  strathfield:{ name:"Strathfield 史卓菲", v:700, p:1400, income:2118, edu:52.7, rates:1450, mh:3000, mu:900,
    eth:"华裔 21.6% · 印度裔 12.0% · 韩裔 9.6% · 尼泊尔裔 8.1%", lang:"普通话 14.4% · 韩语 7.5% · 泰米尔语 4.7%", y:4.8, sch:"Trinity/Santa Sabina 私校带+Homebush Boys/Strathfield Girls,韩华裔重教育" },
  cbank:      { name:"Canterbury-Bankstown 坎特伯雷-宾士镇", v:913, p:1046, income:1556, edu:23.6, rates:1300, mh:1350, mu:580,
    eth:"黎巴嫩裔 14.1% · 澳洲裔 13.9% · 华裔 11.6% · 越南裔 7.3%", lang:"阿拉伯语 17.2% · 越南语 7.5% · 普通话 5.1%", y:5.2, sch:"Sefton HS(部分精英班);整体公校中游" },
  fairfield:  { name:"Fairfield 费尔菲尔德", v:960, p:1200, income:1465, edu:17.8, rates:950, mh:1050, mu:500,
    eth:"越南裔 14.6% · 亚述裔 10.6% · 澳洲裔 9.4% · 华裔 8.2%", lang:"越南语 14.5% · 阿拉伯语 9.7% · 亚述语 8.6%", y:5.5, sch:"Westfields Sports HS 体育特色;整体公校偏弱" },
  liverpool:  { name:"Liverpool 利物浦", v:1131, p:1434, income:1819, edu:20.1, rates:1350, mh:1100, mu:600,
    eth:"澳洲裔 15.6% · 英格兰裔 12.2% · 印度裔 6.0% · 黎巴嫩裔 5.9%", lang:"阿拉伯语 13.1% · 越南语 5.3% · 印地语 3.4%", y:5.4, sch:"Hurlstone Agricultural(精英寄宿,Glenfield);其余一般" },
  campbelltown:{ name:"Campbelltown 坎贝尔镇", v:1400, p:1500, income:1795, edu:20.3, rates:1250, mh:950, mu:570,
    eth:"澳洲裔 24.3% · 英格兰裔 20.1% · 印度裔 6.2% · 菲律宾裔 5.1%", lang:"阿拉伯语 3.5% · 孟加拉语 2.7% · 印地语 2.2%", y:5.6, sch:"公校整体偏弱,私校/教会校为主要升级选项" },
  georgesriver:{ name:"Georges River 乔治斯河", v:590, p:950, income:1966, edu:39.4, rates:1100, mh:1750, mu:750,
    eth:"华裔 21.7% · 英格兰裔 15.2% · 澳洲裔 14.0% · 希腊裔 7.6%", lang:"普通话 11.5% · 粤语 8.6% · 希腊语 4.1%", y:4.9, sch:"St George Girls(精英,Kogarah)+Sydney Technical(精英,Penshurst);Hurstville 学区热" },
  bayside:    { name:"Bayside 湾区议会", v:820, p:1250, income:1892, edu:37.6, rates:1000, mh:1600, mu:750,
    eth:"华裔 14.1% · 英格兰裔 13.2% · 澳洲裔 12.4% · 希腊裔 8.0%", lang:"普通话 6.5% · 希腊语 5.0% · 阿拉伯语 4.9%", y:4.9, sch:"公校中游;近 St George 精英双校" },
  sutherland: { name:"Sutherland Shire 萨瑟兰", v:590, p:1050, income:2244, edu:31.2, rates:1300, mh:1550, mu:800,
    eth:"英格兰裔 30.4% · 澳洲裔 27.2% · 爱尔兰裔 10.1%", lang:"希腊语 1.5% · 普通话 1.4% · 西班牙语 1.0%", y:4.4, sch:"Caringbah HS(精英);家庭区公校整体口碑稳" },
  randwick:   { name:"Randwick 兰德威克", v:690, p:1300, income:2273, edu:51.5, rates:1150, mh:3200, mu:1250,
    eth:"英格兰裔 23.2% · 澳洲裔 17.0% · 爱尔兰裔 10.3% · 华裔 9.6%", lang:"普通话 4.9% · 希腊语 2.6% · 粤语 2.4%", y:4.2, sch:"近 UNSW;东区私校可达,公校分化" },
  waverley:   { name:"Waverley 韦弗利", v:810, p:1800, income:2704, edu:55.4, rates:1300, mh:4000, mu:1500,
    eth:"英格兰裔 23.0% · 澳洲裔 15.2% · 爱尔兰裔 11.0% · 俄裔 4.1%", lang:"俄语 2.6% · 西班牙语 2.5% · 法语 2.0%", y:4.0, sch:"东区私校核心圈(Waverley College 等)" },
  woollahra:  { name:"Woollahra 伍拉拉", v:580, p:1500, income:2836, edu:57.3, rates:1600, mh:5500, mu:1600,
    eth:"英格兰裔 27.4% · 澳洲裔 17.1% · 爱尔兰裔 11.2%", lang:"法语 1.8% · 普通话 1.7% · 俄语 1.5%", y:3.8, sch:"顶级私校走廊(Scots/Ascham/Kambala/Cranbrook)" },
};

// ════════ 水系（经纬度折线/多边形） ════════
const WATER = [
  { kind:"stroke", w:9, pts:[[-33.845,151.300],[-33.850,151.258],[-33.853,151.226],[-33.852,151.207],[-33.848,151.190],[-33.843,151.170],[-33.849,151.150],[-33.840,151.120],[-33.845,151.100],[-33.833,151.070],[-33.825,151.040],[-33.818,151.012]] },        // 海港+帕拉马塔河
  { kind:"fill",  pts:[[-33.965,151.230],[-33.960,151.170],[-33.985,151.140],[-34.010,151.155],[-34.005,151.205],[-33.985,151.228]] },  // 植物学湾
  { kind:"stroke", w:4, pts:[[-33.960,151.155],[-33.943,151.170],[-33.930,151.158],[-33.920,151.143],[-33.912,151.120],[-33.906,151.092],[-33.912,151.062]] }, // 库克斯河
  { kind:"stroke", w:5, pts:[[-34.005,151.145],[-33.992,151.100],[-33.975,151.062],[-33.962,151.022],[-33.968,150.990],[-33.955,150.968],[-33.930,150.950],[-33.918,150.930],[-33.950,150.918]] }, // 乔治斯河
  { kind:"stroke", w:6, pts:[[-33.800,150.652],[-33.750,150.662],[-33.700,150.668],[-33.660,150.690],[-33.628,150.730],[-33.600,150.782],[-33.606,150.822],[-33.630,150.872],[-33.618,150.920]] }, // 尼平-豪克斯伯里河
];
const WATER_LABELS = [
  { la:-33.851, lo:151.243, text:"Sydney Harbour" },
  { la:-33.988, lo:151.183, text:"Botany Bay" },
  { la:-33.660, lo:150.700, text:"Nepean R." },
  { la:-33.975, lo:151.040, text:"Georges R." },
];
