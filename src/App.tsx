import React, { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail, ChevronDown, ExternalLink, Hammer, ChevronUp, X, Send, Loader, MessageSquare, Edit3 } from 'lucide-react';

function App() {
  const projectsRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-element').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSubmitProject = async () => {
    setIsLoading(true);
    setEditMode(false);
    // Simulate AI response - In a real app, this would be an API call
    setTimeout(() => {
      setAiResponse(`Based on my analysis of your project request, here's what I understand:

Project Overview:
${projectDescription}

Key Points:
• The project scope appears to be [scope estimation]
• Main features requested: [extracted from description]
• Potential technical requirements: [based on features]

Would you like to:
1. Proceed with this understanding
2. Refine your request
3. Add more details

Feel free to edit your description if you'd like to provide more clarity or adjust the scope.`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8">
            <Hammer className="w-12 h-12 text-gray-900" />
            <h1 className="text-4xl font-bold ml-4">Webforge</h1>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Forging Digital Excellence
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed">
            Crafting beautiful digital experiences through clean code and thoughtful design
          </p>
          <div className="flex justify-center gap-6 mb-16">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Request Your App
          </button>
        </div>
        <button
          onClick={scrollToProjects}
          className="absolute bottom-8 animate-bounce"
          aria-label="Scroll to projects"
        >
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </button>
      </section>

      {/* Projects Section */}
      <section
        ref={projectsRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center fade-element">
            Selected Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-lg fade-element hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-200 mb-4">{project.description}</p>
                    <a
                      href={project.link}
                      className="inline-flex items-center text-white border border-white px-4 py-2 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      View Project
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center fade-element">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Let's Connect</h2>
          <p className="text-xl text-gray-600 mb-8">
            Have a project in mind? Let's forge something amazing together.
          </p>
          <a
            href="mailto:hello@webforge.dev"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Request App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setProjectDescription('');
                setAiResponse('');
                setEditMode(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-gray-700" />
              <h3 className="text-2xl font-bold">Request Your App</h3>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-600 text-sm">
                Our AI assistant will analyze your request to ensure we understand your needs perfectly. You'll have a chance to review and refine the requirements before submission.
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your project idea
              </label>
              <textarea
                id="project-description"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Tell us about your app idea, features you'd like, and any specific requirements..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={!editMode && aiResponse}
              ></textarea>
            </div>

            {!aiResponse && (
              <button
                onClick={handleSubmitProject}
                disabled={isLoading || !projectDescription.trim()}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    AI is analyzing your request...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Analyze My Request
                  </>
                )}
              </button>
            )}

            {aiResponse && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">AI Analysis</h4>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Request
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap mb-6">
                  {aiResponse}
                </div>
                <div className="flex gap-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleSubmitProject}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Reanalyze Request
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Refine Request
                      </button>
                      <a
                        href={`mailto:hello@webforge.dev?subject=Project Request&body=${encodeURIComponent(`Project Description:\n${projectDescription}\n\nAI Analysis:\n${aiResponse}`)}`}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-center flex items-center justify-center"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Submit Request
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const projects = [
  {
    title: "E-commerce Platform",
    description: "A modern shopping experience built with React and Node.js",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  },
  {
    title: "Travel App",
    description: "Mobile-first travel planning application",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  },
  {
    title: "Finance Dashboard",
    description: "Real-time analytics and reporting platform",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  },
  {
    title: "Social Media App",
    description: "Connect and share with your community",
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  }
];

export default App;