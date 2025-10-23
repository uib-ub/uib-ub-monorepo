import Link from 'next/link';

export default function HomePage() {
  return (
    <div
      className='flex flex-1 flex-col justify-center text-center mt-10'
    >
      <h1 className='text-4xl font-bold mb-4'>
        CHC Registry
      </h1>
      <p>
        You can open{' '}
        <Link
          href="/docs"
          className='font-semibold underline'
        >
          /docs
        </Link>{' '}
        and see the documentation.
      </p>
    </div>
  );
}