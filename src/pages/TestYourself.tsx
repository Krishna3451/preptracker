import React, { useState } from 'react';
import { ChevronRight, FileQuestion, Settings } from 'lucide-react';
import TestModal from '../components/TestModal';

const TestYourself = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testType, setTestType] = useState<'custom' | 'pyq' | null>(null);

  const handleTestSubmit = (testConfig: any) => {
    console.log('Test configuration:', testConfig);
    setIsModalOpen(false);
    // TODO: Implement test creation logic
  };

  const renderTestTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      <button
        onClick={() => setIsModalOpen(true)}
        className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Custom Test</h3>
              <p className="text-sm text-gray-500">Create a personalized test</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
        </div>
      </button>

      <button
        onClick={() => setTestType('pyq')}
        className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <FileQuestion className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">PYQ Mock Test</h3>
              <p className="text-sm text-gray-500">Practice with previous year questions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-all" />
        </div>
      </button>
    </div>
  );

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Test Yourself</h1>
        </div>

        {testType === null ? (
          renderTestTypeSelection()
        ) : testType === 'pyq' ? (
          <div className="p-6 bg-white rounded-xl shadow-sm animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800">PYQ Mock Tests</h2>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        ) : null}
      </div>

      <TestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTestSubmit}
      />
    </>
  );
};

export default TestYourself;