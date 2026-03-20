'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/swagger')
      .then((res) => res.json())
      .then(setSpec);
  }, []);

  if (!spec) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Đang tải API docs...</div>
    </div>
  );

  return (
    <div className="swagger-wrapper">
      <style>{`
        .swagger-wrapper { font-family: sans-serif; }
        .swagger-ui .topbar { background-color: #1d4ed8; }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
      `}</style>
      <SwaggerUI spec={spec} docExpansion="list" />
    </div>
  );
}
