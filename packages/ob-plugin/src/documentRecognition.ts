import type { Tag } from '@sync/shared';

export type RecognitionConfidence = 'high' | 'medium' | 'low';

export interface DocumentRecognitionInput {
  path: string;
  title: string;
  body: string;
  frontmatter: Record<string, unknown>;
}

export interface DocumentRecognitionResult {
  tag: Tag;
  confidence: RecognitionConfidence;
  reason: string;
  signals: string[];
}

interface Rule {
  tag: Tag;
  label: string;
  terms: string[];
}

// 识别只使用文档自身的标题、正文和已存在的关键词；目录名不参与分类，避免把
// “输入/项目”这类路径误当成用户明确意图。规则是确定性的，便于预览、复核和回归测试。
const RULES: Rule[] = [
  {
    tag: 'X',
    label: '项目',
    terms: ['项目', '需求', '里程碑', 'roadmap', 'todo', '待办', '交付', '上线', '迭代'],
  },
  {
    tag: 'L',
    label: '领域',
    terms: ['领域', '体系', '方法论', '原则', '行业', '研究方向', '知识体系'],
  },
  {
    tag: 'Z',
    label: '资源',
    terms: ['资源', '资料', '参考', '书签', '链接', '文档', '教程', '工具', '清单'],
  },
  {
    tag: 'Q',
    label: '灵感',
    terms: ['灵感', '想法', '点子', '假设', '脑暴', 'idea', '启发', '可能性'],
  },
  {
    tag: 'J',
    label: '技能',
    terms: ['技能', '技巧', '操作步骤', '流程', 'sop', '工作流', '实践', '经验'],
  },
];

export function recognizeDocument(input: DocumentRecognitionInput): DocumentRecognitionResult {
  const explicitTag = typeof input.frontmatter.标签 === 'string'
    ? input.frontmatter.标签.trim()
    : '';
  if (isTag(explicitTag)) {
    return {
      tag: explicitTag,
      confidence: 'high',
      reason: '沿用已有合法标签',
      signals: ['frontmatter.标签'],
    };
  }

  const keywordText = Array.isArray(input.frontmatter.关键词)
    ? input.frontmatter.关键词.join(' ')
    : typeof input.frontmatter.关键词 === 'string'
      ? input.frontmatter.关键词
      : '';
  const title = normalize(input.title);
  const body = normalize(input.body.slice(0, 12000));
  const keywords = normalize(keywordText);
  const scores = new Map<Tag, { score: number; signals: string[]; label: string }>();
  for (const rule of RULES) {
    const signals: string[] = [];
    let score = 0;
    for (const term of rule.terms) {
      const normalizedTerm = normalize(term);
      if (title.includes(normalizedTerm)) {
        score += 4;
        signals.push(`标题含“${term}”`);
      }
      if (keywords.includes(normalizedTerm)) {
        score += 3;
        signals.push(`关键词含“${term}”`);
      }
      if (body.includes(normalizedTerm)) {
        score += 1;
        signals.push(`正文含“${term}”`);
      }
    }
    scores.set(rule.tag, { score, signals: [...new Set(signals)], label: rule.label });
  }

  const ranked = [...scores.entries()].sort((left, right) => right[1].score - left[1].score);
  const top = ranked[0];
  const secondScore = ranked[1]?.[1].score ?? 0;
  if (!top || top[1].score === 0) {
    return {
      tag: 'S',
      confidence: 'low',
      reason: '没有足够的分类信号，按低置信度回退为收集',
      signals: ['fallback:S'],
    };
  }

  const confidence: RecognitionConfidence = top[1].score >= 7 && top[1].score - secondScore >= 3
    ? 'high'
    : top[1].score >= 3 && top[1].score - secondScore >= 1
      ? 'medium'
      : 'low';
  const signals = top[1].signals.slice(0, 3);
  return {
    tag: top[0],
    confidence,
    reason: `识别为${top[1].label}${confidence === 'low' ? '，但信号较弱' : ''}`,
    signals: signals.length ? signals : [`rule:${top[0]}`],
  };
}

function isTag(value: string): value is Tag {
  return value === 'S' || value === 'X' || value === 'L' || value === 'Z' || value === 'Q' || value === 'J';
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('zh-CN').replace(/[\s\-_/]+/g, '');
}
