export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Next.js
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Get started by editing{' '}
            <code className="font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              app/page.tsx
            </code>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors">
              <h2 className="text-2xl font-semibold mb-3">Documentation</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find in-depth information about Next.js features and API.
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors">
              <h2 className="text-2xl font-semibold mb-3">Learn</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn about Next.js in an interactive course with quizzes!
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors">
              <h2 className="text-2xl font-semibold mb-3">Templates</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore starter templates for Next.js.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}



