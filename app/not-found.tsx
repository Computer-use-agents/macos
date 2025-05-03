import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
      <p className="mb-4">找不到请求的资源</p>
      <Link href="/" className="text-blue-500 hover:underline">
        返回首页
      </Link>
    </div>
  )
} 