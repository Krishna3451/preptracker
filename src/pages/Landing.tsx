import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    await signInWithGoogle();
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 p-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-indigo-600">PrepTrack</div>
            <div></div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Master Your Prep Journey
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Track your progress, analyze your performance, and achieve your goals with PrepTrack's intelligent learning platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={handleGetStarted}
                className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center"
              >
                Sign in with Google
                <ArrowRight className="ml-2 inline-block h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Target className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Track Progress
              </h3>
              <p className="mt-4 text-gray-600">
                Monitor your learning journey with detailed analytics and progress tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Smart Learning
              </h3>
              <p className="mt-4 text-gray-600">
                Personalized study plans and recommendations based on your performance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Trophy className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Achieve Goals
              </h3>
              <p className="mt-4 text-gray-600">
                Set and accomplish your learning objectives with structured guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of students achieving their goals with PrepTrack.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-block rounded-md bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Start Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
