import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-purple-600 to-blue-600 px-4">

      <div className="text-center text-white max-w-2xl">

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
          Build Your Resume With AI
        </h1>

        <p className="text-sm sm:text-base md:text-lg opacity-90 mb-8">
          Create professional resumes in seconds using intelligent AI suggestions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/db")}
            className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/resume")}
            className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition border border-white"
          >
            Create Resume
          </button>
        </div>

      </div>

    </div>
  );
}

export default Home;