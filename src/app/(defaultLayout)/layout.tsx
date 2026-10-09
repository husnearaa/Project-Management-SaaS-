
import Footer from "@/components/common/footer/Footer";
import Navbar from "@/components/common/navbar/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description: "",
};

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar/>
      <div>{children}</div>
      <Footer/>
    </>
  );
};

export default CommonLayout;


// import Footer from "@/components/shared/Footer";
// import { Navbar } from "@/components/shared/Navbar";
// import TopNavbar from "@/components/shared/TopNavbar";

// const CommonLayout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <>
//       <TopNavbar />
//       <Navbar />
//       <main className="min-h-screen">{children}</main>
//       <Footer />
//     </>
//   );
// };

// export default CommonLayout;