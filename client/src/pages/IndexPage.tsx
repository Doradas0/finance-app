import React from "react";
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const hello = trpc.hello.useQuery();
  if (!hello.data) return <div>Loading Hello...</div>;
  return (
    <div>
      <p>{hello.data}</p>
    </div>
  );
}

