import Navbar from "./Navbar";

const HeroSection = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-7xl font-bold -mt-52 font-handjet tracking-wider mb-8">
          CITY SURVEILLANTS
        </h1>
        <div className="flex space-x-4 font-mono">
          <a href="/upload">
            <button className="px-6 py-4 bg-blue-500 text-white rounded hover:bg-blue-600">
              Get Started
            </button>
          </a>
          <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Learn More
          </button>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
