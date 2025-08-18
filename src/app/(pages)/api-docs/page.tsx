'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null)

  useEffect(() => {
    // Load the OpenAPI spec
    fetch('/api/v1/openapi.json')
      .then(res => res.json())
      .then(data => setSpec(data))
      .catch(err => console.error('Failed to load OpenAPI spec:', err))
  }, [])

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading API documentation...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  )
}