import React, { useState } from "react";
import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";

import Home from "./pages/Home";
import Calendar from "./pages/Calendar";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
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
        {/* <Home /> */}
        <Calendar />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
