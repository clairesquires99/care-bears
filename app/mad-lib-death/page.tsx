import fs from 'fs'
import path from 'path'
import MadLibDeath from '@/src/mad-lib-death'

export default function MadLibDeathPage() {
  const template = fs.readFileSync(
    path.join(process.cwd(), 'src/mad-lib-death/template.txt'),
    'utf-8'
  )

  return <MadLibDeath template={template} />
}
