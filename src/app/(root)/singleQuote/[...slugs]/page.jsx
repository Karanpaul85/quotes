const SingleQuote = async ({ params, searchParams }) => {
  const { slugs } = await params;
  console.log(slugs);
  return (
    <main>
      <img
        src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${slugs[0]}/${slugs[1]}`}
      />
    </main>
  );
};
export default SingleQuote;
