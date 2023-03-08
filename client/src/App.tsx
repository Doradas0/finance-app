import React, { useState } from "react";
import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";

import IndexPage from "./pages/IndexPage";

function App() {
  const [count, setCount] = useState(0);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: null,
      links: [
        httpBatchLink({
          url: "https://ak0xgjx42m.execute-api.eu-west-1.amazonaws.com/prod"
        })
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <IndexPage />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
