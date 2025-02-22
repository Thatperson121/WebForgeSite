import React, { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail, ChevronDown, ExternalLink, Hammer, ChevronUp, X, Send, Loader, MessageSquare, Edit3, Mic, MicOff, Phone } from 'lucide-react';

function App() {
  const projectsRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('original');

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

    try {
      // Remove filler words and clean up the text
      const cleanedText = projectDescription
        .split(' ')
        .map(word => ['like', 'um', 'uh', 'well'].includes(word.toLowerCase()) ? '' : word)
        .filter(Boolean)
        .join(' ');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional project manager and technical writer. Your task is to take a project description and enhance it into a clear, professional, and comprehensive project specification. Focus on technical details, key features, and business value. Keep the tone professional and concise."
            },
            {
              role: "user",
              content: `Please enhance this project description into a professional project specification: ${cleanedText}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate enhanced description');
      }

      const data = await response.json();
      const enhancedDescription = data.choices[0].message.content.trim();
      setAiResponse(enhancedDescription);
    } catch (error) {
      console.error('Error generating enhanced description:', error);
      alert('Failed to generate enhanced description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check supported MIME types
      const mimeType = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg;codecs=opus'
      ].find(type => MediaRecorder.isTypeSupported(type));

      if (!mimeType) {
        throw new Error('No supported audio MIME types found');
      }

      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: mimeType });
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        console.log('Audio blob type:', audioBlob.type);
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setTranscriptionLoading(true);
    try {
      // Verify blob is valid
      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded');
      }

      const formData = new FormData();
      // Use the correct file extension based on the MIME type
      const fileExtension = audioBlob.type.includes('webm') ? 'webm' 
        : audioBlob.type.includes('mp4') ? 'm4a'
        : audioBlob.type.includes('mpeg') ? 'mp3'
        : audioBlob.type.includes('ogg') ? 'ogg'
        : 'webm';

      formData.append('file', audioBlob, `recording.${fileExtension}`);
      formData.append('model', 'whisper-1');

      console.log('Sending file with type:', audioBlob.type);
      console.log('File extension:', fileExtension);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Transcription error:', errorData);
        throw new Error(errorData.error?.message || 'Transcription failed');
      }

      const data = await response.json();
      setProjectDescription((prev: string) => prev + ' ' + data.text.trim());
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert(error instanceof Error ? error.message : 'Error transcribing audio. Please try again.');
    } finally {
      setTranscriptionLoading(false);
    }
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
            Previous Projects
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
                      target="_blank"
                      rel="noopener noreferrer"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center fade-element">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
          <div className="space-y-6 mb-8">
            <div>
              <p className="text-xl text-gray-600 mb-2">
                <Mail className="inline-block w-6 h-6 mr-2 mb-1" />
                <a href="mailto:thewebforge121@gmail.com" className="hover:text-gray-900 transition-colors">
                  thewebforge121@gmail.com
                </a>
              </p>
              <p className="text-gray-600">Email is the best way to reach me - I'll respond as soon as possible!</p>
            </div>
            <div>
              <p className="text-xl text-gray-600 mb-2">
                <Phone className="inline-block w-6 h-6 mr-2 mb-1" />
                <a href="sms:+13857898033" className="hover:text-gray-900 transition-colors">
                  (385) 789-8033
                </a>
              </p>
              <p className="text-gray-600">Note: Text messages only - I am unable to take calls. For the quickest response, please use email.</p>
            </div>
          </div>
          <button
            onClick={scrollToTop}
            className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center"
          >
            <ChevronUp className="w-5 h-5 mr-2" />
            Back to Top
          </button>
        </div>
      </section>

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
              <div className="relative">
                <textarea
                  id="project-description"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Tell us about your app idea, features you'd like, and any specific requirements..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={!editMode && aiResponse}
                ></textarea>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {transcriptionLoading ? (
                    <div className="p-2 text-gray-500">
                      <Loader className="w-5 h-5 animate-spin" />
                    </div>
                  ) : (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-full transition-colors ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      {isRecording ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  {editMode ? (
                    <button
                      onClick={handleSubmitProject}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
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
                  <h4 className="text-lg font-semibold">Select Version to Send</h4>
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
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="original"
                        name="version"
                        className="mr-2"
                        defaultChecked
                        onChange={() => setSelectedVersion('original')}
                      />
                      <label htmlFor="original" className="font-medium">Original Request</label>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {projectDescription}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="enhanced"
                        name="version"
                        className="mr-2"
                        onChange={() => setSelectedVersion('enhanced')}
                      />
                      <label htmlFor="enhanced" className="font-medium">Enhanced Version</label>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {aiResponse}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  {editMode ? (
                    <button
                      onClick={handleSubmitProject}
                      className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Reanalyze Request
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Refine Request
                      </button>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=thewebforge121@gmail.com&su=${encodeURIComponent('New Project Request - WebForge')}&body=${encodeURIComponent(
                          selectedVersion === 'original' ? projectDescription : aiResponse
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-center flex items-center justify-center"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Submit via Gmail
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
    title: "E-commerce Dashboard",
    description: "A comprehensive admin dashboard for managing online stores, featuring real-time analytics and inventory management.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "https://example.com/ecommerce-dashboard"
  },
  {
    title: "Restaurant Website",
    description: "Modern restaurant website with online ordering system and table reservations.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "https://example.com/restaurant-site"
  },
  {
    title: "Fitness Tracking App",
    description: "Mobile-first fitness application with workout planning and progress tracking.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "https://example.com/fitness-app"
  },
  {
    title: "Real Estate Platform",
    description: "Property listing and management platform with virtual tour capabilities.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "https://example.com/real-estate"
  }
];

export default App;