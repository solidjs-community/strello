import { Router } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";

import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <MetaProvider>
      <Title>Trellix Solid</Title>
      <Router
        root={props => (
          <>
            <Suspense>{props.children}</Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}
