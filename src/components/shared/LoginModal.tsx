/**
 * 登录引导弹窗
 * 未登录用户点击需要登录的功能时弹出
 */

import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-2xl px-8 py-7 w-full max-w-md flex flex-col gap-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-0 text-muted-foreground cursor-pointer p-1 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* 内容区域 */}
        <div className="text-center">
          <div className="text-3xl mb-2">⚽</div>
          <div className="text-white text-base font-semibold mb-1.5">
            登录后查看完整赔率走势分析
          </div>
          <div className="text-muted-foreground text-sm">解锁完整数据，助力精准判断</div>
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-border rounded-xl text-muted-foreground text-sm font-semibold cursor-pointer transition-colors hover:border-gray-500"
          >
            取消
          </button>
          <button
            onClick={handleLogin}
            className="flex-[2] py-3 bg-primary border-0 rounded-xl text-primary-foreground text-sm font-bold cursor-pointer transition-colors hover:bg-primary/90"
          >
            去登录
          </button>
        </div>
      </div>
    </div>
  );
}
