'use client'

import { PrimaryButton } from 'polarkit/components/ui/atoms'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-blue-100">
        <div className="flex grow flex-col items-center justify-center space-y-4 p-16">
          <h2 className="text-xl">Something went wrong!</h2>

          <PrimaryButton
            fullWidth={false}
            onClick={() => {
              window.location.href = '/'
            }}
          >
            <span>Go back to Polar</span>
          </PrimaryButton>

          <p className="pt-24 text-gray-600"></p>

          <pre className="whitespace-break-spaces text-sm text-gray-600">
            Error digest: {'digest' in error ? <>{error.digest}</> : 'oh oh'}
          </pre>
        </div>
      </body>
    </html>
  )
}
