import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'
import BackButton from '../BackButton'
import API from '../../lib/api'

function Dashboard() {
  const [counts, setCounts] = useState({ resumes: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function load() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    setLoading(true); setError(null);
    const resp = await API.listResumes();
    if (resp && resp.error) setError(resp.message || 'Failed to load');
    else setCounts({ resumes: (resp || []).length });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('resumes:changed', handler);
    return () => window.removeEventListener('resumes:changed', handler);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 overflow-hidden">

      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <BackButton fallbackRoute="/home" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-col gap-4">

          {/* Resume Banner */}
    <div className="bg-linear-to-r from-purple-500 to-blue-500 text-white p-6 md:p-8 rounded-xl">
            <h2 className="text-xl md:text-2xl font-bold">
              Start Building Your Resume
            </h2>

            <p className="mt-2 text-sm md:text-base">
              Create a professional resume in seconds with AI
            </p>
            <button
              onClick={() => navigate('/resume')}
              className="mt-4 bg-white text-purple-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 active:scale-95 transition"
              >
              Generate Resume
            </button>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div onClick={()=>navigate('/total-resumes')} role="button" tabIndex={0} className="cursor-pointer transform hover:scale-105 hover:shadow-xl transition">
              <Card className="bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle>Total Resumes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    'Loading...'
                  ) : (counts.resumes === 0 ? (
                    <div className="flex items-center justify-between">
                      <div>No resumes created yet.</div>
                      <button className="ml-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-indigo-600 font-bold" onClick={(e)=>{ e.stopPropagation(); navigate('/create-resume'); }}>+</button>
                    </div>
                  ) : (
                    `${counts.resumes} Created`
                  ))}
                </CardContent>
              </Card>
            </div>

            <div onClick={()=>navigate('/ai-suggestions')} role="button" tabIndex={0} className="cursor-pointer transform hover:scale-105 hover:shadow-xl transition">
              <Card className="bg-linear-to-r from-blue-500 to-cyan-500 text-white">
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  Click to manage
                </CardContent>
              </Card>
            </div>

            <div onClick={()=>navigate('/templates')} role="button" tabIndex={0} className="cursor-pointer transform hover:scale-105 hover:shadow-xl transition">
              <Card className="bg-linear-to-r from-green-500 to-emerald-500 text-white">
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  Browse templates
                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default Dashboard