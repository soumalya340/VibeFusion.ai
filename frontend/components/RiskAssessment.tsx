'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { RiskProfile } from '../../shared/types';
import { updateRiskProfile, setUser } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { ChartBarIcon, ShieldCheckIcon, TrophyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface RiskAssessmentProps {
  onComplete: () => void;
}

interface FormData {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: 'preservation' | 'growth' | 'maximum_returns';
}

const experienceLevels = [
  {
    value: 'beginner',
    title: 'Beginner',
    description: 'New to crypto trading',
    icon: ShieldCheckIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900',
  },
  {
    value: 'intermediate',
    title: 'Intermediate', 
    description: 'Some trading experience',
    icon: ChartBarIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: 'Experienced trader',
    icon: TrophyIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
  },
];

const riskTolerances = [
  {
    value: 'conservative',
    title: 'Conservative',
    description: 'Minimize risk, preserve capital',
    maxLoss: '2%',
    maxPosition: '10%',
  },
  {
    value: 'moderate',
    title: 'Moderate',
    description: 'Balanced risk and reward',
    maxLoss: '5%',
    maxPosition: '25%',
  },
  {
    value: 'aggressive',
    title: 'Aggressive',
    description: 'High risk, high potential returns',
    maxLoss: '10%',
    maxPosition: '50%',
  },
];

const investmentGoals = [
  {
    value: 'preservation',
    title: 'Capital Preservation',
    description: 'Protect and slowly grow your capital',
  },
  {
    value: 'growth',
    title: 'Steady Growth',
    description: 'Consistent returns over time',
  },
  {
    value: 'maximum_returns',
    title: 'Maximum Returns',
    description: 'Highest possible gains',
  },
];

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onComplete }) => {
  const dispatch = useDispatch();
  const { walletAddress } = useSelector((state: RootState) => state.auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const watchedValues = watch();

  const calculateRiskParameters = (data: FormData): RiskProfile => {
    let maxPositionSize = 0.1;
    let maxDailyLoss = 0.02;

    // Adjust based on experience
    if (data.experienceLevel === 'intermediate') {
      maxPositionSize = 0.2;
      maxDailyLoss = 0.03;
    } else if (data.experienceLevel === 'advanced') {
      maxPositionSize = 0.3;
      maxDailyLoss = 0.05;
    }

    // Adjust based on risk tolerance
    if (data.riskTolerance === 'moderate') {
      maxPositionSize *= 1.5;
      maxDailyLoss *= 2;
    } else if (data.riskTolerance === 'aggressive') {
      maxPositionSize *= 2.5;
      maxDailyLoss *= 3;
    }

    // Adjust based on goals
    if (data.investmentGoals === 'growth') {
      maxPositionSize *= 1.2;
      maxDailyLoss *= 1.5;
    } else if (data.investmentGoals === 'maximum_returns') {
      maxPositionSize *= 1.5;
      maxDailyLoss *= 2;
    }

    // Cap at maximum values
    maxPositionSize = Math.min(maxPositionSize, 0.5);
    maxDailyLoss = Math.min(maxDailyLoss, 0.1);

    return {
      experienceLevel: data.experienceLevel,
      riskTolerance: data.riskTolerance,
      investmentGoals: data.investmentGoals,
      maxPositionSize,
      maxDailyLoss,
    };
  };

  const onSubmit = async (data: FormData) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      const riskProfile = calculateRiskParameters(data);
      
      // Create user object
      const user = {
        id: walletAddress,
        walletAddress,
        riskProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in localStorage for persistence
      localStorage.setItem('vibefusion_risk_profile', JSON.stringify(riskProfile));
      localStorage.setItem('vibefusion_user', JSON.stringify(user));

      // Update Redux state
      dispatch(setUser(user));
      dispatch(updateRiskProfile(riskProfile));

      toast.success('Risk assessment completed!');
      onComplete();
    } catch (error) {
      console.error('Error saving risk profile:', error);
      toast.error('Failed to save risk assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      title: 'Experience Level',
      description: 'How would you describe your trading experience?',
      field: 'experienceLevel' as keyof FormData,
      options: experienceLevels,
    },
    {
      title: 'Risk Tolerance',
      description: 'How much risk are you comfortable with?',
      field: 'riskTolerance' as keyof FormData,
      options: riskTolerances,
    },
    {
      title: 'Investment Goals',
      description: 'What are your primary investment goals?',
      field: 'investmentGoals' as keyof FormData,
      options: investmentGoals,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Risk Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help us personalize your trading experience with a quick 3-question assessment.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {currentStep + 1} of 3
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(((currentStep + 1) / 3) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {steps[currentStep].options.map((option: any) => {
              const isSelected = watchedValues[steps[currentStep].field] === option.value;
              const IconComponent = option.icon;
              
              return (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register(steps[currentStep].field, { required: 'Please select an option' })}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-4">
                    {IconComponent && (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${option.color}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {option.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {option.description}
                      </p>
                      {option.maxLoss && (
                        <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Max Daily Loss: {option.maxLoss}</span>
                          <span>Max Position: {option.maxPosition}</span>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {errors[steps[currentStep].field] && (
            <p className="text-red-500 text-sm mb-4">
              {errors[steps[currentStep].field]?.message}
            </p>
          )}
        </motion.div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`btn ${
              currentStep === 0
                ? 'btn-secondary opacity-50 cursor-not-allowed'
                : 'btn-secondary'
            }`}
          >
            Previous
          </button>

          {currentStep < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!watchedValues[steps[currentStep].field]}
              className={`btn ${
                !watchedValues[steps[currentStep].field]
                  ? 'btn-primary opacity-50 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !watchedValues[steps[currentStep].field]}
              className={`btn ${
                isSubmitting || !watchedValues[steps[currentStep].field]
                  ? 'btn-primary opacity-50 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default RiskAssessment;
