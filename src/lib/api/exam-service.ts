/**
 * Exam API Service
 * 
 * Service layer for the new exam endpoints that provide enhanced module filtering,
 * multi-module sessions, and exam-specific functionality.
 */

import { apiClient } from '../api-client';

export interface ExamModule {
  id: number;
  name: string;
  unite?: {
    name: string;
    studyPack?: {
      name: string;
    };
  };
}

export interface ExamResponse {
  id: number;
  title: string;
  university: string;
  yearLevel: string;
  year: number;
  module: ExamModule;
}

export interface ExamsByYearResponse {
  examsByYear: Array<{
    year: string;
    exams: ExamResponse[];
  }>;
  residencyExams: {
    available: boolean;
    yearsAvailable: string[];
    exams: ExamResponse[];
  };
}

export interface MultiModuleSessionRequest {
  moduleIds: number[];
  year: number;
}

export interface MultiModuleSessionResponse {
  sessionId: number;
  message: string;
  examCount: number;
  questionCount: number;
}

export interface ModuleAvailabilityCheck {
  moduleId: number;
  year: number;
  hasQuestions: boolean;
  questionCount: number;
  examCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  availableModules: ModuleAvailabilityCheck[];
  unavailableModules: ModuleAvailabilityCheck[];
  totalQuestions: number;
  message?: string;
}

export interface DetailedExamResponse {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  universityId: number;
  yearLevel: string;
  examYear: string;
  year: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  module: {
    id: number;
    uniteId: number;
    name: string;
    description: string;
    unite: {
      id: number;
      studyPackId: number;
      name: string;
      description: string;
      logoUrl: string;
      studyPack: {
        name: string;
      };
    };
  };
  university: {
    name: string;
  };
}

export class ExamService {
  /**
   * Filter exams by module ID
   * GET /api/v1/exams/available?moduleId=24
   */
  static async getExamsByModule(moduleId: number): Promise<ExamsByYearResponse> {
    const response = await apiClient.get(`/exams/available?moduleId=${moduleId}`);
    
    // Handle nested response structure from API tests
    const data = response.data?.data?.data || response.data?.data || response.data;
    return data;
  }

  /**
   * Get exams by module and year
   * GET /api/v1/exams/by-module/24/2024
   */
  static async getExamsByModuleAndYear(moduleId: number, year: number): Promise<DetailedExamResponse[]> {
    const response = await apiClient.get(`/exams/by-module/${moduleId}/${year}`);
    
    // Handle nested response structure from API tests
    const data = response.data?.data?.data || response.data?.data || response.data;
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Create multi-module exam session
   * POST /api/v1/exams/exam-sessions/from-modules
   */
  static async createMultiModuleSession(request: MultiModuleSessionRequest): Promise<MultiModuleSessionResponse> {
    const response = await apiClient.post('/exams/exam-sessions/from-modules', request);
    
    // Handle nested response structure from API tests
    const data = response.data?.data?.data || response.data?.data || response.data;
    return data;
  }

  /**
   * Get enhanced available exams with year filter
   * GET /api/v1/exams/available?year=2024
   */
  static async getAvailableExamsByYear(year: number): Promise<ExamsByYearResponse> {
    const response = await apiClient.get(`/exams/available?year=${year}`);
    
    // Handle nested response structure from API tests
    const data = response.data?.data?.data || response.data?.data || response.data;
    return data;
  }

  /**
   * Get all enhanced available exams
   * GET /api/v1/exams/available
   */
  static async getAllAvailableExams(): Promise<ExamsByYearResponse> {
    const response = await apiClient.get('/exams/available');
    
    // Handle nested response structure from API tests
    const data = response.data?.data?.data || response.data?.data || response.data;
    return data;
  }

  /**
   * Get available modules for exam creation
   * This uses the existing quiz filters endpoint but focuses on modules
   */
  static async getAvailableModules(): Promise<ExamModule[]> {
    try {
      const response = await apiClient.get('/quizzes/quiz-filters');
      const data = response.data?.data || response.data;
      
      // Extract modules from the unites structure
      const modules: ExamModule[] = [];
      if (data.unites && Array.isArray(data.unites)) {
        data.unites.forEach((unite: any) => {
          if (unite.modules && Array.isArray(unite.modules)) {
            unite.modules.forEach((module: any) => {
              modules.push({
                id: module.id,
                name: module.name,
                unite: {
                  name: unite.name,
                  studyPack: unite.studyPack ? {
                    name: unite.studyPack.name
                  } : undefined
                }
              });
            });
          }
        });
      }
      
      return modules;
    } catch (error) {
      console.error('Failed to fetch available modules:', error);
      throw error;
    }
  }

  /**
   * Get available years for exam filtering
   */
  static async getAvailableYears(): Promise<number[]> {
    try {
      const response = await apiClient.get('/quizzes/quiz-filters');
      const data = response.data?.data || response.data;

      // Extract years from quiz filters
      const years = data.availableQuizYears || [];
      return years.sort((a: number, b: number) => b - a); // Sort descending (newest first)
    } catch (error) {
      console.error('Failed to fetch available years:', error);
      throw error;
    }
  }

  /**
   * Validate module availability for a specific year
   * This checks if questions exist for the given modules and year before creating an exam session
   */
  static async validateModuleAvailability(moduleIds: number[], year: number): Promise<ValidationResult> {
    try {
      const availableModules: ModuleAvailabilityCheck[] = [];
      const unavailableModules: ModuleAvailabilityCheck[] = [];
      let totalQuestions = 0;

      // Check each module individually
      for (const moduleId of moduleIds) {
        try {
          const exams = await this.getExamsByModuleAndYear(moduleId, year);

          // Count total questions from all exams for this module
          let moduleQuestionCount = 0;
          if (Array.isArray(exams) && exams.length > 0) {
            // For now, we estimate questions per exam (this could be enhanced with actual question counts)
            moduleQuestionCount = exams.length * 10; // Rough estimate
          }

          const moduleCheck: ModuleAvailabilityCheck = {
            moduleId,
            year,
            hasQuestions: exams.length > 0,
            questionCount: moduleQuestionCount,
            examCount: exams.length
          };

          if (moduleCheck.hasQuestions) {
            availableModules.push(moduleCheck);
            totalQuestions += moduleQuestionCount;
          } else {
            unavailableModules.push(moduleCheck);
          }
        } catch (error) {
          // If we get an error (like 404), treat as unavailable
          unavailableModules.push({
            moduleId,
            year,
            hasQuestions: false,
            questionCount: 0,
            examCount: 0
          });
        }
      }

      const isValid = availableModules.length > 0;
      let message = '';

      if (!isValid) {
        message = `No questions found for the selected modules in year ${year}. Please try selecting different modules or a different year.`;
      } else if (unavailableModules.length > 0) {
        message = `Some modules don't have questions available for year ${year}. Only ${availableModules.length} out of ${moduleIds.length} modules have questions.`;
      }

      return {
        isValid,
        availableModules,
        unavailableModules,
        totalQuestions,
        message
      };
    } catch (error) {
      console.error('Failed to validate module availability:', error);
      throw error;
    }
  }

  /**
   * Get module availability status for all modules in a specific year
   * This is useful for showing availability indicators in the UI
   */
  static async getModuleAvailabilityForYear(year: number): Promise<Map<number, ModuleAvailabilityCheck>> {
    try {
      const modules = await this.getAvailableModules();
      const availabilityMap = new Map<number, ModuleAvailabilityCheck>();

      // Check availability for each module
      for (const module of modules) {
        try {
          const exams = await this.getExamsByModuleAndYear(module.id, year);
          const questionCount = exams.length * 10; // Rough estimate

          availabilityMap.set(module.id, {
            moduleId: module.id,
            year,
            hasQuestions: exams.length > 0,
            questionCount,
            examCount: exams.length
          });
        } catch (error) {
          // If error, mark as unavailable
          availabilityMap.set(module.id, {
            moduleId: module.id,
            year,
            hasQuestions: false,
            questionCount: 0,
            examCount: 0
          });
        }
      }

      return availabilityMap;
    } catch (error) {
      console.error('Failed to get module availability for year:', error);
      throw error;
    }
  }

  /**
   * Pre-validate exam session creation
   * This should be called before attempting to create an exam session
   */
  static async preValidateExamSession(request: MultiModuleSessionRequest): Promise<ValidationResult> {
    return this.validateModuleAvailability(request.moduleIds, request.year);
  }
}

export default ExamService;
