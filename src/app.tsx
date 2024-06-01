import { Router } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";

import { FileRoutes } from "@solidjs/start/router";
import Layout from "./components/Layout";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <MetaProvider>
      <Title>Strello</Title>
      <Router
        root={props => (
          <Layout>
            <Suspense>{props.children}</Suspense>
          </Layout>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}
