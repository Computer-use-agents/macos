export interface TraceItem {
  timestamp: string;
  screenshot: string;
  thought: string;
  action: string;
  video: string;
  timeRange: {
    start: number; // 视频开始时间(秒)
    end: number;   // 视频结束时间(秒)
  };
}

export interface TraceData {
  items: TraceItem[];
} 