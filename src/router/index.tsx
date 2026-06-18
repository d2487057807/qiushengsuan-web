/**
 * 路由入口
 */

import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

// 创建路由实例，配置 basename
export const router = createBrowserRouter(routes, {
  basename: '/qiushengsuan',
});
