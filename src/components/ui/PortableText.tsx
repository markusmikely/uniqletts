import { PortableText as PortableTextComponent } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

interface Props {
  value: PortableTextBlock[]
  className?: string
}

export default function PortableText({ value, className }: Props) {
  if (!value?.length) return null
  return (
    <div className={className}>
      <PortableTextComponent value={value} />
    </div>
  )
}
