'use client';

import SwaggerUI from 'swagger-ui-react';
import "swagger-ui-react/swagger-ui.css";

export default function OpenAPIViewer({ spec, url }: any) {
  return (
    <SwaggerUI spec={spec} url={url} />
  );
}