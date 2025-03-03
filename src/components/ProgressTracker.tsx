import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { progressService, SubjectProgress } from '../services/progressService';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProgressTrackerProps {
  className?: string;
}

interface ProgressTrackerRef {
  updateProgress: (update: {
    subject: string;
    chapter: string;
    theoryRevision: boolean;
    questionsPracticed: number;
  }) => Promise<void>;
}

const ProgressTracker = forwardRef<ProgressTrackerRef, ProgressTrackerProps>((props, ref) => {
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.uid) return;
      try {
        const progress = await progressService.getUserProgress(user.uid);
        setSubjectProgress(progress);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user?.uid]);

  useImperativeHandle(ref, () => ({
    updateProgress: async (update: {
      subject: string;
      chapter: string;
      theoryRevision: boolean;
      questionsPracticed: number;
    }) => {
      if (!user?.uid) return;
      
      try {
        await progressService.updateUserProgress(user.uid, update);
        const updatedProgress = await progressService.getUserProgress(user.uid);
        setSubjectProgress(updatedProgress);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const barChartData = {
    labels: subjectProgress.map((item) => item.subject),
    datasets: [
      {
        label: 'Completed Chapters',
        data: subjectProgress.map((item) => 
          item.chapters.filter(ch => ch.theoryRevision).length
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Chapters',
        data: subjectProgress.map((item) => item.totalChapters),
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: subjectProgress.map((item) => item.subject),
    datasets: [
      {
        data: subjectProgress.map(
          (item) => Math.round((item.chapters.filter(ch => ch.theoryRevision).length / item.totalChapters) * 100)
        ),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)', // Biology - Green
          'rgba(153, 102, 255, 0.8)', // Physics - Purple
          'rgba(255, 159, 64, 0.8)', // Chemistry - Orange
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chapter Completion',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...subjectProgress.map(item => item.totalChapters)) + 2,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Overall Progress (%)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: { label?: string; formattedValue?: string }) {
            return `${context.label || ''}: ${context.formattedValue || '0'}%`;
          },
        },
      },
    },
  };

  return (
    <div className={`space-y-8 ${props.className || ''}`}>
      {/* Subject-wise Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjectProgress.map((subject) => (
          <div key={subject.subject} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{subject.subject}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {Math.round((subject.chapters.filter(ch => ch.theoryRevision).length / subject.totalChapters) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${(subject.chapters.filter(ch => ch.theoryRevision).length / subject.totalChapters) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">{subject.chapters.filter(ch => ch.theoryRevision).length} / {subject.totalChapters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Questions Solved</span>
                <span className="font-medium">{subject.chapters.reduce((sum, ch) => sum + ch.questionsPracticed, 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Chapter Completion</h3>
          <div className="h-[300px]">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
          <div className="h-[300px]">
            <Pie data={pieChartData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Chapter Details */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Detailed Chapter Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjectProgress.map((subject) => (
            <div key={subject.subject} className="space-y-4">
              <h4 className="font-medium text-gray-800">{subject.subject}</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {subject.chapters.map((chapter) => (
                  <div key={chapter.name} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">{chapter.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${chapter.theoryRevision ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs">{chapter.questionsPracticed} Q</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ProgressTracker.displayName = 'ProgressTracker';

export default ProgressTracker; 