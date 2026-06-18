/**
 * 应用入口组件
 */

import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/router';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" theme="dark" />
    </>
  );
}
