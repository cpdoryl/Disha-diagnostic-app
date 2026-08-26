/**
 * First Opinion Engine v3 - Challenge Response Form
 * Collects respondent answers to 15 challenges across 5 domains
 */

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { db } from '../../../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

const challengeSchema = z.object({
  schoolId: z.string().min(1, 'School required'),
  cycleId: z.string().min(1, 'Assessment cycle required'),
  responderId: z.string().min(1, 'Respondent ID required'),
  role: z.enum(['TEACHER', 'PARENT', 'STUDENT', 'ADMIN', 'OTHER']),
  email: z.string().email('Valid email required'),
  responses: z.record(
    z.object({
      challengeId: z.string(),
      severity: z.number().min(1).max(10),
      factualEvidence: z.boolean(),
      notes: z.string().optional(),
    })
  ),
})

type ChallengeFormData = z.infer<typeof challengeSchema>

const CHALLENGES = [
  { id: 'C1', title: 'Teaching Quality', domain: 'Teaching & Learning', severity: 'high' },
  { id: 'C2', title: 'Curriculum Alignment', domain: 'Teaching & Learning', severity: 'high' },
  { id: 'C3', title: 'Student Learning Outcomes', domain: 'Teaching & Learning', severity: 'high' },
  { id: 'C4', title: 'Sanitation & Water', domain: 'Infrastructure & Resources', severity: 'high' },
  { id: 'C5', title: 'Building Safety', domain: 'Infrastructure & Resources', severity: 'high' },
  { id: 'C6', title: 'Lab & Computer Facilities', domain: 'Infrastructure & Resources', severity: 'medium' },
  { id: 'C7', title: 'Teacher Staffing', domain: 'Staffing & HR', severity: 'high' },
  { id: 'C8', title: 'Professional Development', domain: 'Staffing & HR', severity: 'medium' },
  { id: 'C9', title: 'Teacher Performance', domain: 'Staffing & HR', severity: 'medium' },
  { id: 'C10', title: 'Financial Records', domain: 'Finance & Operations', severity: 'high' },
  { id: 'C11', title: 'Fee Collection System', domain: 'Finance & Operations', severity: 'medium' },
  { id: 'C12', title: 'Facility Maintenance', domain: 'Finance & Operations', severity: 'medium' },
  { id: 'C13', title: 'Parent & Community', domain: 'Governance & Community', severity: 'medium' },
  { id: 'C14', title: 'Regulatory Compliance', domain: 'Governance & Community', severity: 'high' },
  { id: 'C15', title: 'Student Safeguarding', domain: 'Governance & Community', severity: 'high' },
]

const DOMAINS = ['Teaching & Learning', 'Infrastructure & Resources', 'Staffing & HR', 'Finance & Operations', 'Governance & Community']

interface ChallengeResponseFormProps {
  schoolId: string
  cycleId: string
  responderId: string
  role: 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER'
  email: string
  onSubmitSuccess?: () => void
  onSubmitError?: (error: Error) => void
}

export const ChallengeResponseForm: React.FC<ChallengeResponseFormProps> = ({
  schoolId,
  cycleId,
  responderId,
  role,
  email,
  onSubmitSuccess,
  onSubmitError,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set())

  const { control, handleSubmit, watch, formState: { errors } } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      schoolId,
      cycleId,
      responderId,
      role,
      email,
      responses: {},
    },
  })

  const responses = watch('responses')

  const currentChall = CHALLENGES[currentChallenge]
  const progress = (completedChallenges.size / CHALLENGES.length) * 100

  const onSubmit = async (data: ChallengeFormData) => {
    if (completedChallenges.size < CHALLENGES.length) {
      alert('Please complete all 15 challenges before submitting')
      return
    }

    setSubmitting(true)
    try {
      // Submit each challenge response to Firestore
      const challengeResponsesRef = collection(
        db,
        'schools',
        schoolId,
        'assessmentCycles',
        cycleId,
        'challengeResponses'
      )

      for (const [challengeId, response] of Object.entries(data.responses)) {
        const challenge = CHALLENGES.find((c) => c.id === challengeId)
        if (challenge) {
          await addDoc(challengeResponsesRef, {
            challengeId,
            responderId,
            role,
            email,
            schoolId,
            cycleId,
            challenge: {
              title: challenge.title,
              domain: challenge.domain,
              weight: 1 / 15,
              description: challenge.title,
            },
            responses: {
              severity: {
                text: `Severity: ${response.severity}/10`,
                selectedOption: response.severity,
                maxOption: 10,
                isFact: response.factualEvidence,
              },
            },
            notes: response.notes,
            submittedAt: Timestamp.now(),
            deleted: false,
          })
        }
      }

      onSubmitSuccess?.()
    } catch (error) {
      console.error('Error submitting responses:', error)
      onSubmitError?.(error instanceof Error ? error : new Error('Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleChallengeComplete = () => {
    const newCompleted = new Set(completedChallenges)
    newCompleted.add(currentChall.id)
    setCompletedChallenges(newCompleted)
  }

  const handleNext = () => {
    if (currentChallenge < CHALLENGES.length - 1) {
      handleChallengeComplete()
      setCurrentChallenge(currentChallenge + 1)
    }
  }

  const handlePrev = () => {
    if (currentChallenge > 0) {
      setCurrentChallenge(currentChallenge - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">First Opinion Assessment</h2>
        <p className="text-gray-600">Rate your school across 15 key challenges</p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700">Progress</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{completedChallenges.size} of {CHALLENGES.length} challenges completed</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Challenge Header */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{currentChall.title}</h3>
              <p className="text-sm text-gray-600">{currentChall.domain}</p>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-semibold ${
              currentChall.severity === 'high'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {currentChall.severity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Severity Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How severe is this challenge? (1 = Not at all, 10 = Extremely severe)
          </label>
          <Controller
            name={`responses.${currentChall.id}.severity`}
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  {...field}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                  {field.value || '-'}
                </span>
              </div>
            )}
          />
        </div>

        {/* Factual Evidence */}
        <div className="mb-6">
          <Controller
            name={`responses.${currentChall.id}.factualEvidence`}
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                <input
                  type="checkbox"
                  {...field}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  This is based on factual evidence or data (not just perception)
                </span>
              </label>
            )}
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional notes (optional)
          </label>
          <Controller
            name={`responses.${currentChall.id}.notes`}
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="Provide context or examples..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            )}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentChallenge === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-600 text-center py-2">
            Challenge {currentChallenge + 1} of {CHALLENGES.length}
          </div>

          {currentChallenge === CHALLENGES.length - 1 ? (
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {submitting ? 'Submitting...' : '✓ Submit Assessment'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next →
            </button>
          )}
        </div>
      </form>

      {/* Domain Legend */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-xs font-semibold text-gray-600 mb-3">DOMAINS</p>
        <div className="grid grid-cols-2 gap-2">
          {DOMAINS.map((domain) => (
            <div key={domain} className="text-xs text-gray-600">
              • {domain}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChallengeResponseForm
