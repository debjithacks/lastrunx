interface FlaticonIconProps {
  name: string
  style?: 'regular' | 'bold' | 'solid'
  className?: string
}

export function FlaticonIcon({ 
  name, 
  style = 'regular', 
  className = '' 
}: FlaticonIconProps) {
  const prefix = style === 'bold' ? 'fi-br' : style === 'solid' ? 'fi-sr' : 'fi-rr'
  return <i className={`${prefix}-${name} ${className}`}></i>
}
