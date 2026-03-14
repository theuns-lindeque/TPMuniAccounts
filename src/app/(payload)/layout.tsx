import '@payloadcms/next/css'

type Args = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Args) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
