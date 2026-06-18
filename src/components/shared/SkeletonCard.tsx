/**
 * 赛事卡片骨架屏组件
 */

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      {/* 头部：联赛 + 时间 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-secondary rounded" />
          <div className="w-20 h-5 bg-secondary rounded" />
        </div>
        <div className="w-12 h-5 bg-secondary rounded" />
      </div>

      {/* 队伍区域 */}
      <div className="flex items-center justify-between mb-5">
        {/* 主队 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full" />
          <div className="w-16 h-5 bg-secondary rounded" />
        </div>

        {/* VS */}
        <div className="w-8 h-6 bg-secondary rounded" />

        {/* 客队 */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-5 bg-secondary rounded" />
          <div className="w-10 h-10 bg-secondary rounded-full" />
        </div>
      </div>

      {/* 赔率区域 */}
      <div className="bg-secondary/50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-secondary rounded" />
          <div className="h-12 bg-secondary rounded" />
          <div className="h-12 bg-secondary rounded" />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-secondary rounded-lg" />
        <div className="flex-1 h-9 bg-secondary rounded-lg" />
      </div>
    </div>
  );
}
