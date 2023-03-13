'use client';

import "swagger-ui-react/swagger-ui.css"
import SwaggerUI from 'swagger-ui-react'

export default function OpenAPIViewer({ spec, url }: any) {
  return (
    /* @ts-ignore */
    <SwaggerUI spec={spec} url={url} />
  );
}