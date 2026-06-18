/**
 * 空状态组件
 */

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = '暂无数据',
  description = '明日赛事预告即将上线',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* 足球场插图 */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-50"
      >
        {/* 外框 */}
        <rect x="10" y="20" width="100" height="80" rx="4" stroke="#2A2D3A" strokeWidth="2" />
        {/* 中线 */}
        <line x1="60" y1="20" x2="60" y2="100" stroke="#2A2D3A" strokeWidth="2" />
        {/* 中圈 */}
        <circle cx="60" cy="60" r="15" stroke="#2A2D3A" strokeWidth="2" />
        <circle cx="60" cy="60" r="2" fill="#2A2D3A" />
        {/* 左禁区 */}
        <rect x="10" y="40" width="20" height="40" stroke="#2A2D3A" strokeWidth="2" />
        {/* 右禁区 */}
        <rect x="90" y="40" width="20" height="40" stroke="#2A2D3A" strokeWidth="2" />
        {/* 足球 */}
        <circle cx="60" cy="60" r="6" fill="#00D68F" opacity="0.3" />
      </svg>

      {/* 标题 */}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>

      {/* 描述 */}
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </div>
  );
}
