import "../styles/index.css";
import "tailwind-ui/styles.css";

import type { AppProps } from "next/app";
import * as React from "react";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <React.StrictMode>
      <>
        <Component {...pageProps} />
      </>
    </React.StrictMode>
  );
};

export default App;
