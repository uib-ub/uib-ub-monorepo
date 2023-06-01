// the about page is a static page, so it doesn't need to be fetched from the server

export default function AboutRoute() {
  return (
    <>
      <h1 className='text-2xl font-extrabold'>About</h1>
      <p>
        Something from a CMS or something
      </p>
    </>
  );
}