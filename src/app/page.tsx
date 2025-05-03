'use client';

import React from 'react';
import TraceViewer from '../components/TraceViewer';

// 使用模拟数据
const sampleData = {
  items: [
    {
      timestamp: '2024-03-20T10:00:00Z',
      screenshot: 'public/screenshots/image.png',
      thought: 'Agent正在分析当前屏幕内容，识别出用户正在浏览文档并尝试找到特定信息。通过分析屏幕元素和文本内容，我确定用户可能需要帮助导航到文档的特定部分。',
      video: 'public/videos/test.mp4',
      action: '分析文档导航',
      timeRange: {
        start: 0,
        end: 20
      }
    },
    {
      timestamp: '2024-03-20T10:02:30Z',
      screenshot: 'public/screenshots/image.png',
      thought: 'Agent观察到用户正在尝试编辑文本，但似乎遇到了格式问题。我识别出这是一个文本格式化任务，用户可能需要帮助使用合适的快捷键或菜单选项来完成任务。',
      video: 'public/videos/test.mp4',
      action: '辅助文本格式化',
      timeRange: {
        start: 20,
        end: 40
      }
    },
    {
      timestamp: '2024-03-20T10:05:15Z',
      screenshot: 'public/screenshots/image.png',
      thought: 'Agent识别出用户正在搜索特定信息。基于用户的搜索模式和浏览行为，我推断用户正在寻找与"机器学习数据分析"相关的资料，可能是为了一个研究项目或学习任务。',
      video: 'public/videos/test.mp4',
      action: '协助信息搜索',
      timeRange: {
        start: 40,
        end: 60
      }
    },
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <TraceViewer data={sampleData} />
    </main>
  );
} 