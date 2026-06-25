/*
 * VLA Radar · 策展拓扑数据（与首页 index.html 共用）
 * 这些是「人工策展」的慢变结构：主线节点 / 分化支路 / 代表作 / benchmark 家族。
 * 动态论文仍走 /api/vla-radar/list；这里只放需要跨页复用的策展骨架。
 * 暴露为 window.VLA_CURATED，供 series / explorer / flow / bench / metro 等视角页使用。
 */
(function (g) {
  // 主线：范式转移节点（trunk）
  const timeline = [
    {id:'rt-1', year:'2022', title:'RT-1', paperIds:['2212.06817'], tags:['Robot Transformer','BC','Action Token'], text:'证明真实机器人多任务数据 + Transformer 可以扩展；动作多以离散 token 形式输出。'},
    {id:'palm-e-rt-2', year:'2023', title:'PaLM-E / RT-2', paperIds:['2303.03378','2307.15818'], tags:['VLM Backbone','Web Knowledge'], text:'VLM/LLM 语义先验进入机器人控制，动作被映射到语言 token 空间。'},
    {id:'open-x-rt-x', year:'2023', title:'Open X-Embodiment / RT-X', paperIds:['2310.08864'], tags:['Cross-Embodiment','Dataset'], text:'把不同机构、机器人、任务标准化，开启 X-robot policy。'},
    {id:'octo-openvla', year:'2024', title:'Octo / OpenVLA', paperIds:['2405.12213','2406.09246'], tags:['Open Source','Generalist'], text:'开放 generalist policy 与 7B VLA 进入社区复现视野。'},
    {id:'pi0-rdt', year:'2024', title:'π0 / RDT', paperIds:['2410.24164','2410.07864'], tags:['Flow','Diffusion','Action Expert'], text:'连续动作块成为主流解法，action expert 从 backbone 中分离。'},
    {id:'fast', year:'2025', title:'FAST', paperIds:['2501.09747'], tags:['Action Tokenizer','Hybrid'], text:'用频域压缩 action token 改善离散动作表示，兼顾训练效率。'},
    {id:'oft-vla0', year:'2025', title:'OpenVLA-OFT / VLA-0', paperIds:['2502.19645','2510.13054'], tags:['Strong Baseline','Continuous Action'], text:'围绕 OpenVLA 的慢推理、离散动作和复杂架构提出强实用改造与反直觉 baseline。'},
    {id:'smolvla', year:'2025', title:'SmolVLA', paperIds:['2506.01844'], tags:['Efficient','Frozen VLM','Community Data'], text:'小模型、冻结 VLM、训练 action expert，用社区低成本数据做可复现 VLA。'},
    {id:'pi05', year:'2025', title:'π0.5', paperIds:['2504.16054'], tags:['Hierarchy','Web Data','Subtask'], text:'同一模型内加入高层 subtask 与低层 action，强化开放世界泛化。'},
    {id:'pi06-recap', year:'2025', title:'π0.6-star / RECAP', paperIds:['2511.14759'], tags:['RL','Experience','Advantage'], text:'VLA 从演示学习走向部署后自我改进：rollout、reward、intervention 进入训练闭环。'},
    {id:'star-simvla', year:'2026', title:'StarVLA / SimVLA', paperIds:['2604.11757','2602.18224'], tags:['Simple Baseline','Benchmark'], text:'强简单 baseline 进入视野：小模型、统一 benchmark 和更少复杂技巧也能打出很强表现。'},
    {id:'pi07', year:'2026', title:'π0.7', paperIds:['2604.15483'], tags:['Steerable','Metadata','Subgoal Image'], text:'prompt/context 成为控制接口：metadata、subgoal image、world model、history 共同 steer 行为。'}
  ];

  // 分化支路（branch lines）
  const branches = [
    {id:'benchmark-generalization', icon:'🧪', title:'Benchmark 真实性与泛化评测', paperIds:['2306.03310','2510.03827','2603.28301','2510.13626','2405.05941'], text:'标准 LIBERO 是否被背题？换语言、物体、初始位置、环境后是否崩掉？结果是否真的测到泛化。'},
    {id:'action-representation', icon:'🦾', title:'Action Decoder / Representation', paperIds:['2304.13705','2303.04137','2307.15818','2405.12213','2406.09246','2410.24164','2410.07864','2501.09747','2502.19645','2411.19650'], text:'离散 token、FAST、flow、diffusion、continuous action chunk、action expert，以及速度和稳定性的权衡。'},
    {id:'simple-baselines', icon:'⚡', title:'小模型 / 简单 Baseline / 可复现', paperIds:['2409.12514','2502.19645','2506.01844','2510.13054','2604.11757','2602.18224'], text:'TinyVLA、SmolVLA、OpenVLA-OFT、VLA-0、StarVLA、SimVLA：重新审视复杂架构是否真的必要。'},
    {id:'reasoning-planning', icon:'🧭', title:'High-level Reasoning / Subtask / Goal Image', paperIds:['2504.16054','2604.15483','2508.07917','2605.02881'], text:'VLA 不能只会输出低层动作，还要知道阶段、目标、质量、计划和中间状态。'},
    {id:'experience-rl', icon:'🔁', title:'RL / Post-training / Experience', paperIds:['2511.14759'], text:'BC 到底不够在哪里？失败数据、reward feedback、人类 intervention 和部署经验如何让 VLA 继续变强。'},
    {id:'spatial-grounding', icon:'📐', title:'3D / Spatial Grounding / Depth', paperIds:['2501.15830','2508.09071','2510.13375','2508.07917'], text:'很多失败不是语言不懂，而是空间关系、姿态、抓取几何和深度不准；这一支专门补几何感知。'}
  ];

  // 代表作（已带 cat 分类，可作为组件归属的种子）
  const works = [
    {title:'ACT / ALOHA', arxiv_id:'2304.13705', cat:'action', tags:['action chunk','bimanual']},
    {title:'Diffusion Policy', arxiv_id:'2303.04137', cat:'action', tags:['diffusion','visuomotor']},
    {title:'LIBERO', arxiv_id:'2306.03310', cat:'benchmark', tags:['benchmark','lifelong']},
    {title:'Meta-World', arxiv_id:'1910.10897', cat:'benchmark', tags:['benchmark','multi-task']},
    {title:'ManiSkill', arxiv_id:'2107.14483', cat:'benchmark', tags:['3d','simulation']},
    {title:'RoboTwin', arxiv_id:'2504.13059', cat:'benchmark', tags:['bimanual','digital twin']},
    {title:'RT-1', arxiv_id:'2212.06817', cat:'mainline', tags:['robot transformer','BC']},
    {title:'RT-2', arxiv_id:'2307.15818', cat:'vlm', tags:['VLM','action as token']},
    {title:'Open X-Embodiment / RT-X', arxiv_id:'2310.08864', cat:'data', tags:['cross-embodiment','dataset']},
    {title:'Octo', arxiv_id:'2405.12213', cat:'open', tags:['open generalist','goal image']},
    {title:'OpenVLA', arxiv_id:'2406.09246', cat:'open', tags:['7B','open source','LoRA']},
    {title:'π0', arxiv_id:'2410.24164', cat:'action', tags:['flow matching','action expert']},
    {title:'RDT-1B', arxiv_id:'2410.07864', cat:'action', tags:['diffusion','bimanual']},
    {title:'FAST', arxiv_id:'2501.09747', cat:'action', tags:['tokenizer','frequency']},
    {title:'OpenVLA-OFT', arxiv_id:'2502.19645', cat:'efficient', tags:['continuous action','26x']},
    {title:'SmolVLA', arxiv_id:'2506.01844', cat:'efficient', tags:['frozen VLM','community data']},
    {title:'VLA-0', arxiv_id:'2510.13054', cat:'baseline', tags:['text action','simple baseline']},
    {title:'StarVLA-alpha', arxiv_id:'2604.11757', cat:'baseline', tags:['simple-vla','strong baseline']},
    {title:'SimVLA', arxiv_id:'2602.18224', cat:'baseline', tags:['simple-vla','benchmark']},
    {title:'CogACT', arxiv_id:'2411.19650', cat:'reasoning', tags:['cognition','action module']},
    {title:'MolmoAct', arxiv_id:'2508.07917', cat:'reasoning', tags:['spatial reasoning','trace']},
    {title:'π0.5', arxiv_id:'2504.16054', cat:'hierarchy', tags:['subtask','web data']},
    {title:'π0.6-star / RECAP', arxiv_id:'2511.14759', cat:'rl', tags:['RL','advantage','intervention']},
    {title:'π0.7', arxiv_id:'2604.15483', cat:'context', tags:['metadata','subgoal image','world model']},
    {title:'LIBERO-PRO', arxiv_id:'2510.03827', cat:'benchmark', tags:['stress-test','memorization']},
    {title:'LIBERO-Para', arxiv_id:'2603.28301', cat:'benchmark', tags:['paraphrase','language']},
    {title:'LIBERO-Plus', arxiv_id:'2510.13626', cat:'benchmark', tags:['robustness','perturbation']},
    {title:'SpatialVLA', arxiv_id:'2501.15830', cat:'spatial', tags:['3d','spatial']},
    {title:'GeoVLA', arxiv_id:'2508.09071', cat:'spatial', tags:['point cloud','geometry']},
    {title:'DepthVLA', arxiv_id:'2510.13375', cat:'spatial', tags:['depth','spatial']}
  ];

  // benchmark 家族（先看尺子）
  const benchmarks = [
    {id:'benchmark-libero', icon:'🧪', badge:'Main Benchmark', title:'LIBERO', paperIds:['2306.03310'], text:'当前 VLA 论文最常见的仿真评测之一，Spatial / Object / Goal / Long 四套件经常成为主结果表的核心坐标。'},
    {id:'benchmark-libero-stress', icon:'🧨', badge:'Benchmark Stress Test', title:'LIBERO-PRO / Para / Plus', paperIds:['2510.03827','2603.28301','2510.13626'], text:'专门追问标准 LIBERO 高分是否真等于泛化：扰动物体、初始状态、指令、环境和 paraphrase，看模型是否只是背题。'},
    {id:'benchmark-simpler', icon:'🔁', badge:'Sim-to-Real Proxy', title:'SimplerEnv', paperIds:['2405.05941'], text:'用仿真评估真实机器人策略，关注 simulated evaluation 和真实策略表现之间是否相关，是 VLA 实验常见补充。'},
    {id:'benchmark-household', icon:'🍳', badge:'Long-horizon Household', title:'RoboCasa / RoboCasa365', paperIds:['2406.02523','2603.04356'], text:'面向厨房和家庭长程任务的大规模仿真环境，适合观察 household generalization、数据生成和长期任务组合。'},
    {id:'benchmark-bimanual', icon:'🦾', badge:'Bimanual / Synthetic Data', title:'RoboTwin / RoboTwin2.0', paperIds:['2504.13059','2506.18088','2410.07864'], text:'双臂、数字孪生、强域随机化和合成数据评测，对 bimanual VLA 与 diffusion transformer 路线很关键。'},
    {id:'benchmark-legacy', icon:'🧭', badge:'Legacy / Auxiliary', title:'CALVIN / Meta-World / ManiSkill', paperIds:['2112.03227','1910.10897','2107.14483'], text:'CALVIN 是老牌长程语言条件操作 benchmark；Meta-World / ManiSkill 常作为小模型、空间 VLA 或泛化能力的辅助评估。'}
  ];

  // VLA 解剖：一篇论文「动了哪一层」。每个组件给一组 tag 关键词（子串匹配，小写）。
  // 顺序≈一条 VLA 从感知到执行再到回流的栈，flow 页可直接按此顺序铺。
  const components = [
    {key:'backbone',  icon:'🧠', name:'VLM / LLM 骨干',  short:'语义感知主干', stage:'编码',
     desc:'用预训练视觉语言模型当感知与语义骨干，决定模型“看懂没看懂”。',
     match:['vlm-backbone','vlm','foundation-model','foundation-models','embodied-llm','web-knowledge','web-data','semantic-generalization','mixture-transformer','multimodal-token','representation-alignment','knowledge-transfer','language-conditioned','instruction-following']},
    {key:'reasoning', icon:'🧭', name:'推理 / 规划 / 层级', short:'高层想清楚再动', stage:'决策',
     desc:'在动作之前先想：阶段、子目标、计划、世界模型、记忆，把长程任务拆开。',
     match:['reasoning','action-reasoning','embodied-reasoning','latent-reasoning','planning','spatial-plan','world-model','world-models','long-horizon','keyframes','fast-slow','memory','context-conditioning','steerable','scene-graphs','retry']},
    {key:'spatial',   icon:'📐', name:'空间 / 3D / 几何',  short:'把空间关系看准', stage:'感知',
     desc:'补几何：点云、深度、姿态、抓取几何，解决“语言懂了但空间不准”的失败。',
     match:['geometry','spatial-grounding','spatial-reasoning','3d','3d-representation','3d-spatial','point-cloud','depth-reasoning','depth-aware','depthvla','grounding','physics-guidance','spatialvla','geovla']},
    {key:'action',    icon:'🦾', name:'动作头 / 解码',    short:'怎么把意图变动作', stage:'生成',
     desc:'动作表示与解码：离散 token、FAST、flow、diffusion、连续动作块、action expert。',
     match:['action-expert','action-decoder','action-tokenization','action-chunking','action-representation','flow-matching','diffusion-policy','diffusion-action','diffusion-head','continuous-action','continuous-control','discrete-diffusion','fast','dct','autoregressive-vla','mlp-head','text-action','act','action-reasoning']},
    {key:'data',      icon:'📦', name:'数据 / 规模',      short:'喂什么、喂多少', stage:'数据',
     desc:'数据来源与规模：跨本体、合成、社区、人类视频、数字孪生、域随机化。',
     match:['cross-embodiment','openx','rt-x','synthetic-data','synthetic-video','community-data','human-data','real-robot-data','data-scaling','data-efficient','dataset','co-training','digital-twin','domain-randomization','robotwin','robocasa365']},
    {key:'training',  icon:'🔁', name:'训练 / 后训练',    short:'BC 之外怎么变强', stage:'训练',
     desc:'后训练范式：微调、LoRA、RL、advantage、人类纠正、部署经验回流。',
     match:['fine-tuning','finetuning','post-training','reinforcement-learning','rl','recap','advantage-conditioning','interventions','behavior-cloning','imitation-learning','value-models','value-learning','continual-learning','active-learning','transfer','policy-learning','deployment']},
    {key:'efficiency',icon:'⚡', name:'效率 / 部署',      short:'够快够省才能上车', stage:'部署',
     desc:'推理速度、延迟、异步执行、量化、显存、移动平台，让策略真的能跑。',
     match:['efficient-vla','efficiency','latency','async-inference','quantization','mobile-manipulation','multi-camera','wrist-camera']},
    {key:'eval',      icon:'🧪', name:'评测 / 审计',      short:'分数到底能不能信', stage:'评测',
     desc:'尺子本身：benchmark 设计、标准化、压力测试、扰动泛化、刷榜审计。',
     match:['benchmark','benchmark-audit','benchmark-unification','vla-evaluation','evaluation','libero','libero-para','libero-plus','libero-pro','stress-test','robustness','perturbation','paraphrase','language-robustness','generalization','sim2real','sim-to-real','policy-evaluation','simplerenv','simulation','meta-rl','multi-task']},
    {key:'safety',    icon:'🛡️', name:'安全 / 可靠',      short:'别在关键时刻翻车', stage:'可靠',
     desc:'安全与可靠：对抗、水印溯源、失败检测、共享自主、形式化验证、医疗等高危场景。',
     match:['security','safety','robot-safety','adversarial','watermark','wam','model-provenance','verification','conformal','failure-detection','recovery','shared-autonomy','human-in-loop','assistive-robotics','medical-robotics','endoscopy']}
  ];

  // 给一篇论文（tags 数组）返回它命中的组件 key 列表（可多个）。
  function classify(tags) {
    const low = (tags || []).map(t => String(t).toLowerCase());
    const hit = [];
    for (const c of components) {
      if (low.some(t => c.match.some(m => t === m || t.includes(m)))) hit.push(c.key);
    }
    return hit;
  }

  // 8 条 VLA 开放痛点：判「一篇重不重要」的尺子，地图按这 8 条组织。
  // key 与后端 store.js 的 PAIN_KEYS 一一对应。
  const painPoints = [
    {key:'data',           icon:'📦', name:'数据瓶颈',        short:'机器人数据稀缺；web/合成/人类/跨本体数据怎么真用起来'},
    {key:'generalization', icon:'🌍', name:'泛化',            short:'换物体/场景/指令/本体还能不能用，benchmark 是否真在测泛化'},
    {key:'action',         icon:'🦾', name:'动作表示与控制',  short:'flow/diffusion/token 取舍，高频灵巧控制，延迟 vs 质量'},
    {key:'reasoning',      icon:'🧭', name:'长程 / 高层推理',  short:'子任务分解、规划、world model、记忆'},
    {key:'posttrain',      icon:'🔁', name:'部署后变强',      short:'BC 的天花板；RL / 经验 / intervention / value'},
    {key:'efficiency',     icon:'⚡', name:'效率 / 可复现 / 上车', short:'推理速度、小模型、冻结 VLM、异步 —— 你 SmolVLA 这条'},
    {key:'eval',           icon:'🧪', name:'评测可信度',      short:'分数是真的吗：标准化、压力测试、饱和、刷榜'},
    {key:'safety',         icon:'🛡️', name:'鲁棒 / 安全',      short:'恢复、失败检测、OOD、安全'}
  ];

  g.VLA_CURATED = { timeline, branches, works, benchmarks, components, classify, painPoints };
})(window);

