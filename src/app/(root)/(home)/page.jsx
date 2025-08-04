import Image from "next/image";
export const metadata = {
  title: "hello",
  description:
    "sdsdsdsdsds dsdd csdsds dsdsd csdsd sdsds sdsc sds ss scs scs wc",
  keywords: "sdsd sdsd sds dsds",
  openGraph: {
    title: "hello",
    description:
      "sdsdsdsdsds dsdd csdsds dsdsd csdsd sdsds sdsc sds ss scs scs wc",
    url: "https://res.cloudinary.com/doycfib2h/image/upload/v1754292494/082025/img_1754292491540.jpg",
    siteName: "homeBannerRes?.ogTagJson?.site_name",
    images: [
      {
        url: "https://res.cloudinary.com/doycfib2h/image/upload/v1754292494/082025/img_1754292491540.jpg",
        width: 400,
        height: 400,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
const Home = async () => {
  return (
    <Image
      src="https://res.cloudinary.com/doycfib2h/image/upload/v1754292494/082025/img_1754292491540.jpg"
      width="1024"
      height="1024"
      alt="testing"
    />
  );
};
export default Home;
