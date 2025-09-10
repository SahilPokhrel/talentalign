// src/pages/LandingPage.js
import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import AOS from "aos";
import "aos/dist/aos.css";
import { ReactTyped } from "react-typed";
import CareerGrowth from "../assets/illustrations/career-growth.png";
import {
  BarChart,
  Brain,
  Target,
  Upload,
  FileText,
  Sparkles,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Instagram,
  Star,
} from "lucide-react";

function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="pt-32 pb-20 bg-gradient-to-r from-[#0F172A] to-[#6366F1] text-white"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 px-6">
          {/* Left Content */}
          <div className="text-center md:text-left" data-aos="fade-right">
            <h2 className="text-5xl font-bold mb-6">Your AI-Powered Career Mentor</h2>
            <p className="text-lg max-w-xl mb-8 text-gray-200">
              Optimize your resume, uncover missing skills, and plan your career
              path with AI-driven insights tailored just for you.
            </p>
            <a
              href="/resume"
              className="bg-white text-[#0F172A] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition inline-flex items-center gap-2"
            >
              Try it now →
            </a>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center md:justify-end" data-aos="fade-left">
            <img
              src={CareerGrowth}
              alt="Career Growth Illustration"
              className="w-20 md:w-[100px] lg:w-[200px]"
            />
          </div>
        </div>
      </section>

      {/* Typing Effect Section */}
      <section
        className="relative py-32 bg-[#F8FAFC] text-center overflow-hidden"
        data-aos="fade-up"
      >
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/dots.png')] opacity-10" />

        {/* Tagline Above */}
        <p className="text-[#6366F1] font-semibold uppercase tracking-wider mb-4 relative z-10">
          Powered by AI · Designed for You
        </p>

        <h3 className="text-3xl font-bold text-[#0F172A] mb-6 relative z-10">
          Why Choose TalentAlign?
        </h3>

        {/* Typing Effect */}
        <ReactTyped
          strings={[
            "✔ Optimize your resume for Applicant Tracking Systems (ATS)",
            "✔ Get personalized career insights powered by AI",
            "✔ Detect missing skills in your resume instantly",
            "✔ Receive AI-suggested resume bullet points",
            "✔ Match your resume with job descriptions in seconds",
            "✔ Discover top-demand skills in your industry",
            "✔ Generate a personalized career roadmap",
            "✔ Improve your chances of landing interviews",
            "✔ Save time with automated resume analysis",
            "✔ Gain confidence with data-driven career advice",
          ]}
          typeSpeed={50}
          backSpeed={30}
          loop
          className="text-xl text-[#0F172A] font-semibold relative z-10"
        />

        {/* Animated Gradient Divider */}
        <div className="mt-10 w-32 h-1 mx-auto bg-gradient-to-r from-[#6366F1] to-[#14B8A6] rounded-full animate-pulse" />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div
          className="bg-white shadow hover:shadow-lg rounded-xl p-8 border-t-4 border-[#6366F1] transition text-center"
          data-aos="fade-up"
        >
          <BarChart className="w-12 h-12 text-[#6366F1] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#6366F1] mb-3">ATS Analysis</h3>
          <p>Instantly check your resume’s compatibility with job descriptions and beat the ATS.</p>
        </div>

        <div
          className="bg-white shadow hover:shadow-lg rounded-xl p-8 border-t-4 border-[#14B8A6] transition text-center"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Target className="w-12 h-12 text-[#14B8A6] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#14B8A6] mb-3">Skill Gap Detection</h3>
          <p>Identify missing skills and see exactly what you need to improve to land your dream job.</p>
        </div>

        <div
          className="bg-white shadow hover:shadow-lg rounded-xl p-8 border-t-4 border-[#0F172A] transition text-center"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <Brain className="w-12 h-12 text-[#0F172A] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#0F172A] mb-3">AI Suggestions</h3>
          <p>Get personalized resume rewrites and career roadmaps generated by AI.</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 text-center gap-8">
          <div data-aos="fade-up">
            <h3 className="text-4xl font-bold text-[#6366F1]">5,000+</h3>
            <p className="text-gray-600">Resumes Analyzed</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-4xl font-bold text-[#14B8A6]">80%</h3>
            <p className="text-gray-600">Improved Interview Chances</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="400">
            <h3 className="text-4xl font-bold text-[#0F172A]">1,000+</h3>
            <p className="text-gray-600">Professionals Helped</p>
          </div>
        </div>
      </section>

      {/* ABOUT Section (new) */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left text */}
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">
                About <span className="text-[#6366F1]">TalentAlign</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                TalentAlign is your AI-powered career partner. We help you tailor your
                resumes to job descriptions with actionable feedback, ATS scoring,
                and personalized improvement tips — all so you can land interviews faster.
              </p>

              <dl className="mt-8 space-y-4">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-sm font-bold">✓</span>
                  <div className="ml-3">
                    <dt className="font-semibold text-[#0F172A]">AI-Powered Analysis</dt>
                    <dd className="text-gray-600">
                      We check for missing skills, semantic match, and ATS-friendliness with every scan.
                    </dd>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-bold">✓</span>
                  <div className="ml-3">
                    <dt className="font-semibold text-[#0F172A]">Actionable Suggestions</dt>
                    <dd className="text-gray-600">
                      Concrete tips on keywords, structure, and phrasing that improve impact and clarity.
                    </dd>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-sm font-bold">✓</span>
                  <div className="ml-3">
                    <dt className="font-semibold text-[#0F172A]">Your Privacy First</dt>
                    <dd className="text-gray-600">
                      Your documents stay secure. You control your data — export or delete anytime.
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/resume"
                  className="inline-block bg-[#6366F1] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#4F46E5] transition"
                >
                  Analyze my resume
                </a>
                <a
                  href="#features"
                  className="inline-block border px-5 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Explore features
                </a>
              </div>
            </div>

            {/* Right image/illustration */}
            <div className="mt-10 lg:mt-0" data-aos="fade-left">
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop"
                alt="About TalentAlign"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (id changed to 'how') */}
      <section className="py-20 bg-gray-50" id="how">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h3 className="text-3xl font-bold text-[#0F172A] mb-12" data-aos="fade-up">
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white shadow rounded-xl p-8 transition hover:shadow-lg" data-aos="fade-up">
              <Upload className="w-14 h-14 text-[#6366F1] mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">1. Upload Resume</h4>
              <p className="text-gray-600">
                Upload your resume in seconds. Our system parses your skills and experience.
              </p>
            </div>

            <div
              className="bg-white shadow rounded-xl p-8 transition hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <FileText className="w-14 h-14 text-[#14B8A6] mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">2. Paste Job Description</h4>
              <p className="text-gray-600">
                Provide a job description to compare against your resume instantly.
              </p>
            </div>

            <div
              className="bg-white shadow rounded-xl p-8 transition hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <Sparkles className="w-14 h-14 text-[#0F172A] mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">3. Get AI Insights</h4>
              <p className="text-gray-600">
                See your ATS score, missing skills, and receive AI-powered improvement tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100 text-center">
        <h3 className="text-3xl font-bold text-[#0F172A] mb-12" data-aos="fade-up">
          What People Say
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition" data-aos="zoom-in">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Priya Sharma"
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <h4 className="font-semibold text-lg">Priya Sharma</h4>
            <div className="flex justify-center text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="italic text-gray-600">
              “TalentAlign helped me restructure my resume and I got interview calls within a week!”
            </p>
          </div>

          <div
            className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Arjun Mehta"
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <h4 className="font-semibold text-lg">Arjun Mehta</h4>
            <div className="flex justify-center text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="italic text-gray-600">
              “The skill gap analysis showed me exactly what to focus on to get into data science.”
            </p>
          </div>

          <div
            className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <img
              src="https://randomuser.me/api/portraits/women/65.jpg"
              alt="Sneha Gupta"
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <h4 className="font-semibold text-lg">Sneha Gupta</h4>
            <div className="flex justify-center text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="italic text-gray-600">
              “AI suggestions improved my resume in ways I never thought of. Highly recommend!”
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-gray-300 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">TalentAlign</h2>
            <p className="text-sm text-gray-400">
              Your AI-powered career mentor. Optimize resumes, uncover skill gaps, and land your dream job.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-white">Home</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white">Features</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">About</a>
              </li>
              <li>
                <a href="/resume" className="hover:text-white">Try It Now</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/docs" className="hover:text-white">Documentation</a></li>
              <li><a href="/support" className="hover:text-white">Support</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@talentalign.com" className="hover:text-white">
                  support@talentalign.com
                </a>
              </li>
              <li className="flex space-x-4 mt-4">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Centered Below */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
          <p className="text-sm text-gray-400 mb-4">Get the latest career tips & product updates.</p>
          <form className="max-w-md mx-auto flex bg-gray-800 rounded-full overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
            />
            <button className="bg-[#6366F1] px-6 py-2 text-white font-semibold hover:bg-[#4F46E5]">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} TalentAlign. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
