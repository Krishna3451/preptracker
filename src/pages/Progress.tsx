import React, { useRef } from 'react';
import ProgressTracker from '../components/ProgressTracker';
import UpdateProgress from '../components/UpdateProgress';

const Progress: React.FC = () => {
  const progressTrackerRef = useRef<any>(null);

  const handleProgressUpdate = (update: {
    subject: string;
    chapter: string;
    theoryRevision: boolean;
    questionsPracticed: number;
  }) => {
    if (progressTrackerRef.current?.updateProgress) {
      progressTrackerRef.current.updateProgress(update);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Progress Analytics</h1>
          <UpdateProgress onProgressUpdate={handleProgressUpdate} />
        </div>
        
        <ProgressTracker ref={progressTrackerRef} />
      </div>
    </div>
  );
};

export default Progress; 