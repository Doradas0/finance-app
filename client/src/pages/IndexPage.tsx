import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const hello = trpc.hello.useQuery();
  const greet = trpc.greet.useQuery({ name: 'Dan' });
  if (!hello.data) return <div>Loading Hello...</div>;
  if (!greet.data) return <div>Loading Greet...</div>;
  return (
    <div>
      <p>{hello.data}</p>
      <p>{greet.data}</p>
    </div>
  );
}

