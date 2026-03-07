import Link from 'next/link'

const demos: { title: string; description: string; href: string }[] = [
  {
    title: 'Mad Lib Death',
    description: '',
    href: '/mad-lib-death',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-8 py-16 dark:bg-black">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Care Bears
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Feature demos
        </p>
        <ul className="mt-10 flex flex-col gap-3">
          {demos.map(({ title, description, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200 px-5 py-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {title}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
