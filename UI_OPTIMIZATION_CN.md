# Postiz 中文 UI 优化指南

本文档详细说明了为适配中国用户使用习惯而进行的 UI 设计优化。

---

## 📋 目录

1. [优化概述](#优化概述)
2. [配色方案](#配色方案)
3. [字体优化](#字体优化)
4. [组件优化](#组件优化)
5. [使用指南](#使用指南)
6. [设计原则](#设计原则)
7. [技术实现](#技术实现)

---

## 优化概述

### 核心改进

✅ **5 套中文主题配色**
- 中国红主题（深色）
- 青花瓷主题（深色）
- 翡翠绿主题（深色）
- 明亮中国风（浅色）
- 清新蓝白（浅色）

✅ **中文字体优化**
- 优先使用苹方、微软雅黑等中文字体
- 优化字间距和行高适配中文阅读
- 支持中文衬线字体

✅ **组件尺寸调整**
- 按钮最小宽度增加至 88px（适配中文文本）
- 输入框高度调整为 40px
- 更大的内边距和间距

✅ **圆角和阴影优化**
- 更圆润的圆角设计（6px-28px）
- 更柔和的阴影效果

---

## 配色方案

### 1. 中国红主题 (cn-red)

**适用场景**: 喜庆、热烈、传统节日

**主色调**:
- 主色: `#d4380d` (中国红)
- 辅助色: `#ff7875` (柔和红)
- 背景: `#1a0f0f` (深红黑)
- 内容背景: `#2d1a1a`

**特点**:
- 传统中国红配色
- 适合春节、国庆等节日使用
- 热烈而不刺眼

```css
/* 使用方式 */
<html class="cn-red">
```

---

### 2. 青花瓷主题 (cn-blue) ⭐ 推荐

**适用场景**: 商务、专业、日常使用

**主色调**:
- 主色: `#1890ff` (青花蓝)
- 辅助色: `#52c41a` (翠绿)
- 背景: `#0f1a2e` (深蓝黑)
- 内容背景: `#1a2a42`

**特点**:
- 灵感来自中国青花瓷
- 专业且优雅
- 适合长时间使用
- **默认深色主题**

```css
/* 使用方式 */
<html class="cn-blue">
```

---

### 3. 翡翠绿主题 (cn-jade)

**适用场景**: 清新、自然、健康

**主色调**:
- 主色: `#52c41a` (翡翠绿)
- 辅助色: `#13c2c2` (青色)
- 背景: `#0f1f18` (深绿黑)
- 内容背景: `#1a2f26`

**特点**:
- 灵感来自翡翠玉石
- 清新护眼
- 适合长时间工作

```css
/* 使用方式 */
<html class="cn-jade">
```

---

### 4. 明亮中国风 (cn-light)

**适用场景**: 白天使用、明亮环境

**主色调**:
- 主色: `#d4380d` (中国红)
- 辅助色: `#fa541c` (橙红)
- 背景: `#fff9f5` (米白)
- 内容背景: `#ffffff` (纯白)

**特点**:
- 明亮温暖
- 适合白天使用
- 中国风配色

```css
/* 使用方式 */
<html class="cn-light">
```

---

### 5. 清新蓝白 (cn-light-blue) ⭐ 推荐

**适用场景**: 白天使用、商务场景

**主色调**:
- 主色: `#1890ff` (青花蓝)
- 辅助色: `#52c41a` (翠绿)
- 背景: `#f5f8ff` (淡蓝白)
- 内容背景: `#ffffff` (纯白)

**特点**:
- 清新专业
- 适合白天使用
- **默认浅色主题**

```css
/* 使用方式 */
<html class="cn-light-blue">
```

---

## 字体优化

### 字体栈

```css
/* 主字体（无衬线） */
font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
             'WenQuanYi Micro Hei', sans-serif;

/* 衬线字体 */
font-family: 'Songti SC', 'SimSun', 'STSong', serif;

/* 等宽字体 */
font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
```

### Tailwind 类名

```jsx
// 使用中文字体
<div className="font-sans-cn">中文内容</div>

// 使用中文衬线字体
<div className="font-serif-cn">中文标题</div>
```

### 字间距优化

```jsx
// 紧凑
<p className="tracking-cn-tight">紧凑文本</p>

// 正常（推荐）
<p className="tracking-cn-normal">正常文本</p>

// 宽松
<p className="tracking-cn-wide">宽松文本</p>

// 更宽松
<p className="tracking-cn-wider">更宽松文本</p>
```

### 行高优化

```jsx
// 紧凑
<p className="leading-cn-tight">行高 1.4</p>

// 正常（推荐）
<p className="leading-cn-normal">行高 1.6</p>

// 宽松
<p className="leading-cn-relaxed">行高 1.8</p>

// 更宽松
<p className="leading-cn-loose">行高 2.0</p>
```

---

## 组件优化

### 1. 按钮组件 (CNButton)

**特点**:
- 最小宽度 88px（适配中文）
- 更大的内边距
- 5 种样式变体
- 3 种尺寸

**使用示例**:

```tsx
import { CNButton } from '@/components/ui/cn-components';

// 主要按钮
<CNButton variant="primary" size="medium">
  发布帖子
</CNButton>

// 次要按钮
<CNButton variant="secondary" size="medium">
  取消
</CNButton>

// 轮廓按钮
<CNButton variant="outline" size="medium">
  编辑
</CNButton>

// 文本按钮
<CNButton variant="text" size="small">
  查看详情
</CNButton>

// 危险按钮
<CNButton variant="danger" size="medium">
  删除
</CNButton>

// 带图标和加载状态
<CNButton
  variant="primary"
  loading={isLoading}
  icon={<PlusIcon />}
>
  添加
</CNButton>
```

**尺寸对比**:

| 尺寸 | 高度 | 最小宽度 | 内边距 | 字号 |
|------|------|----------|--------|------|
| small | 32px | 64px | 12px | 12px |
| medium | 40px | 88px | 20px | 14px |
| large | 48px | 120px | 28px | 16px |

---

### 2. 输入框组件 (CNInput)

**特点**:
- 高度 40px（更舒适）
- 支持左右图标
- 错误提示和帮助文本
- 优化的焦点状态

**使用示例**:

```tsx
import { CNInput } from '@/components/ui/cn-components';

// 基础输入框
<CNInput
  label="用户名"
  placeholder="请输入用户名"
/>

// 带图标
<CNInput
  label="搜索"
  placeholder="搜索内容"
  leftIcon={<SearchIcon />}
/>

// 带错误提示
<CNInput
  label="邮箱"
  placeholder="请输入邮箱"
  error="邮箱格式不正确"
/>

// 带帮助文本
<CNInput
  label="密码"
  type="password"
  helperText="密码长度至少 8 位"
/>
```

---

### 3. 卡片组件 (CNCard)

**特点**:
- 圆角 16px
- 柔和阴影
- 可选标题和操作区
- 4 种内边距选项

**使用示例**:

```tsx
import { CNCard } from '@/components/ui/cn-components';

// 基础卡片
<CNCard padding="medium">
  <p>卡片内容</p>
</CNCard>

// 带标题
<CNCard
  title="统计数据"
  subtitle="最近 7 天"
  padding="large"
>
  <div>图表内容</div>
</CNCard>

// 带操作按钮
<CNCard
  title="我的帖子"
  headerAction={
    <CNButton variant="text" size="small">
      查看全部
    </CNButton>
  }
>
  <div>帖子列表</div>
</CNCard>
```

---

### 4. 标签组件 (CNBadge)

**使用示例**:

```tsx
import { CNBadge } from '@/components/ui/cn-components';

<CNBadge variant="default">默认</CNBadge>
<CNBadge variant="success">成功</CNBadge>
<CNBadge variant="warning">警告</CNBadge>
<CNBadge variant="error">错误</CNBadge>
<CNBadge variant="info">信息</CNBadge>
```

---

### 5. 提示框组件 (CNAlert)

**使用示例**:

```tsx
import { CNAlert } from '@/components/ui/cn-components';

<CNAlert type="info" title="提示">
  这是一条信息提示
</CNAlert>

<CNAlert type="success" title="成功">
  操作已成功完成
</CNAlert>

<CNAlert type="warning" title="警告">
  请注意检查输入内容
</CNAlert>

<CNAlert type="error" title="错误" onClose={() => {}}>
  操作失败，请重试
</CNAlert>
```

---

### 6. 主题切换器 (CNThemeSwitcher)

**使用示例**:

```tsx
import { CNThemeSwitcher } from '@/components/ui/cn-theme-switcher';

// 在导航栏或设置页面中使用
<CNThemeSwitcher />
```

**Hook 使用**:

```tsx
import { useCNTheme } from '@/components/ui/cn-theme-switcher';

function MyComponent() {
  const theme = useCNTheme();

  return <div>当前主题: {theme}</div>;
}
```

---

## 使用指南

### 1. 启用中文主题

在应用入口或布局组件中添加主题切换器:

```tsx
// apps/frontend/src/components/layout/layout.component.tsx
import { CNThemeSwitcher } from '@/components/ui/cn-theme-switcher';

export const Layout = () => {
  return (
    <div>
      <header>
        {/* 其他导航项 */}
        <CNThemeSwitcher />
      </header>
      {/* 页面内容 */}
    </div>
  );
};
```

### 2. 使用中文优化组件

替换现有组件为中文优化版本:

```tsx
// 之前
import { Button } from '@/components/ui/button';

// 之后
import { CNButton } from '@/components/ui/cn-components';
```

### 3. 应用中文排版样式

在需要优化中文排版的容器上添加类名:

```tsx
<div className="cn-typography">
  <h1>中文标题</h1>
  <p>中文段落内容，自动应用优化的字间距和行高。</p>
</div>
```

### 4. 使用中文间距

```tsx
// 使用中文优化的间距
<div className="gap-cn-md">  {/* 16px */}
  <div className="p-cn-lg">  {/* padding: 24px */}
    内容
  </div>
</div>
```

### 5. 使用中文圆角

```tsx
// 使用中文优化的圆角
<div className="rounded-cn-lg">  {/* 16px */}
  内容
</div>
```

---

## 设计原则

### 1. 色彩原则

**传统与现代结合**
- 采用中国传统色彩（中国红、青花蓝、翡翠绿）
- 结合现代 UI 设计理念
- 保持色彩饱和度适中，避免过于鲜艳

**层次分明**
- 主色用于重要操作和强调
- 辅助色用于次要信息
- 背景色层次清晰，便于区分内容区域

**护眼优先**
- 深色主题避免纯黑背景
- 浅色主题避免纯白背景
- 文字与背景对比度符合 WCAG AA 标准

---

### 2. 字体原则

**优先中文字体**
- 系统自带中文字体优先
- 回退到通用字体
- 避免使用不支持中文的字体

**字号适中**
- 正文 14px（比英文大 1-2px）
- 标题 18-24px
- 小字 12px

**行高宽松**
- 中文行高建议 1.6-1.8
- 英文行高建议 1.4-1.6
- 标题行高可适当减小

---

### 3. 间距原则

**更大的间距**
- 中文字符视觉密度高，需要更多空间
- 按钮内边距增加 20-30%
- 卡片间距增加 15-25%

**统一的间距系统**
- 使用 6px、10px、16px、24px、32px、48px
- 避免使用奇数间距
- 保持垂直和水平间距一致

---

### 4. 圆角原则

**更圆润的设计**
- 中国用户偏好圆润的设计
- 小组件 6-10px
- 中等组件 12-16px
- 大组件 20-28px

---

## 技术实现

### 文件结构

```
apps/frontend/src/
├── app/
│   ├── colors.scss           # 原有配色
│   ├── colors-cn.scss        # 中文主题配色 ✨
│   └── global.scss           # 全局样式（已更新）
├── components/
│   └── ui/
│       ├── cn-theme-switcher.tsx  # 主题切换器 ✨
│       └── cn-components.tsx      # 中文优化组件 ✨
└── tailwind.config.js        # Tailwind 配置（已更新）
```

### 主题切换实现

使用 `@mantine/hooks` 的 `useLocalStorage` 持久化主题选择:

```tsx
const [theme, setTheme] = useLocalStorage<CNTheme>({
  key: 'cn-theme',
  defaultValue: 'cn-blue',
});

useEffect(() => {
  document.documentElement.classList.remove(/* 所有主题 */);
  document.documentElement.classList.add(theme);
}, [theme]);
```

### CSS 变量系统

所有颜色使用 CSS 变量，便于主题切换:

```scss
:root {
  .cn-blue {
    --new-btn-primary: #1890ff;
    --new-bgColor: #0f1a2e;
    // ...
  }
}
```

### Tailwind 扩展

在 `tailwind.config.js` 中扩展配置:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'sans-cn': ['PingFang SC', 'Microsoft YaHei', ...],
      },
      letterSpacing: {
        'cn-normal': '0.02em',
      },
      lineHeight: {
        'cn-normal': '1.6',
      },
      // ...
    },
  },
};
```

---

## 最佳实践

### 1. 渐进式迁移

不需要一次性替换所有组件，可以逐步迁移:

1. 先启用中文主题配色
2. 在新页面使用中文优化组件
3. 逐步替换旧页面的组件

### 2. 保持一致性

- 同一页面使用统一的组件库
- 保持间距和圆角的一致性
- 统一使用中文字体栈

### 3. 响应式设计

使用中文优化的断点:

```tsx
<div className="cn-sm:text-sm cn-md:text-base cn-lg:text-lg">
  响应式文本
</div>
```

### 4. 可访问性

- 保持足够的颜色对比度
- 按钮和链接有明确的焦点状态
- 支持键盘导航

---

## 浏览器兼容性

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ 国产浏览器（基于 Chromium）

---

## 常见问题

### Q: 如何设置默认主题？

A: 修改 `cn-theme-switcher.tsx` 中的 `defaultValue`:

```tsx
const [theme, setTheme] = useLocalStorage<CNTheme>({
  key: 'cn-theme',
  defaultValue: 'cn-blue', // 修改这里
});
```

### Q: 如何添加自定义主题？

A: 在 `colors-cn.scss` 中添加新主题:

```scss
:root {
  .my-theme {
    --new-btn-primary: #your-color;
    // ...
  }
}
```

然后在 `cn-theme-switcher.tsx` 中添加选项:

```tsx
const themes = [
  // ...
  { value: 'my-theme', label: '我的主题', icon: '🎨' },
];
```

### Q: 中文字体不生效？

A: 确保在组件上添加了 `font-sans-cn` 类名:

```tsx
<div className="font-sans-cn">
  中文内容
</div>
```

### Q: 如何禁用主题切换？

A: 移除 `<CNThemeSwitcher />` 组件，并在 HTML 标签上固定主题类:

```tsx
<html className="cn-blue">
```

---

## 更新日志

### v1.0.0 (2026-03-08)

✨ 初始版本
- 5 套中文主题配色
- 中文字体优化
- 6 个中文优化组件
- 主题切换器
- 完整文档

---

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进中文 UI 优化！

### 提交主题配色

1. 在 `colors-cn.scss` 中添加新主题
2. 在 `cn-theme-switcher.tsx` 中注册主题
3. 提供主题说明和使用场景
4. 提交 PR

### 提交组件优化

1. 在 `cn-components.tsx` 中添加新组件
2. 确保组件支持中文字体和间距
3. 提供使用示例
4. 提交 PR

---

## 许可证

本优化方案遵循 Postiz 项目的开源许可证。

---

## 联系方式

如有问题或建议，请通过以下方式联系:

- GitHub Issues: [postiz-app/issues](https://github.com/likejing/postiz-app/issues)
- 文档: [docs.postiz.com](https://docs.postiz.com)

---

*最后更新: 2026年3月8日*
