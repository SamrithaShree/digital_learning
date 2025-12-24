// // File: lib/offlineAPI.ts

// const BASE_URL = 'http://127.0.0.1:8000/api';

// interface QuizAnswer {
//   [questionId: string]: string;
// }

// interface OfflineContent {
//   quizzes: any[];
//   videos: any[];
//   sync_timestamp: string;
//   version: number;
// }

// interface QuizResult {
//   score: number;
//   correct_answers: number;
//   total_questions: number;
//   badges_earned: string[];
//   offline_mode: boolean;
//   sync_needed: boolean;
//   message: string;
// }

// interface OfflineStatus {
//   offline_mode: boolean;
//   unsynced_attempts: number;
//   offline_sessions: number;
//   last_sync: string | null;
//   needs_sync: boolean;
//   student_id: string | null;
// }

// export const offlineAPI = {
//   // Download content for offline use
//   downloadContent: async (): Promise<OfflineContent> => {
//     try {
//       const response = await fetch(`${BASE_URL}/offline/download/`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       localStorage.setItem('offlineQuizzes', JSON.stringify(data));
//       localStorage.setItem('offlineMode', 'true');
//       return data;
//     } catch (error) {
//       console.error('Download failed:', error);
//       throw error;
//     }
//   },
  
//   // Submit quiz offline or online
//   submitQuiz: async (
//     quizId: number, 
//     answers: QuizAnswer, 
//     isOffline: boolean = true, 
//     studentId?: string
//   ): Promise<QuizResult> => {
//     try {
//       const response = await fetch(`${BASE_URL}/offline/submit/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           quiz_id: quizId,
//           answers: answers,
//           offline_mode: isOffline,
//           student_id: studentId || localStorage.getItem('studentId')
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       // Store offline attempts for later sync
//       if (isOffline) {
//         const offlineAttempts = JSON.parse(localStorage.getItem('offlineAttempts') || '[]');
//         offlineAttempts.push({
//           quiz_id: quizId,
//           answers: answers,
//           score: result.score,
//           timestamp: new Date().toISOString()
//         });
//         localStorage.setItem('offlineAttempts', JSON.stringify(offlineAttempts));
//       }
      
//       return result;
//     } catch (error) {
//       console.error('Submit failed:', error);
//       throw error;
//     }
//   },
  
//   // Check offline status
//   getStatus: async (token: string): Promise<OfflineStatus> => {
//     try {
//       const response = await fetch(`${BASE_URL}/offline/status/`, {
//         headers: { 'Authorization': `Token ${token}` }
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Status check failed:', error);
//       throw error;
//     }
//   },

//   // Toggle offline mode
//   toggleOfflineMode: async (token: string, offlineMode: boolean): Promise<{offline_mode: boolean; message: string}> => {
//     try {
//       const response = await fetch(`${BASE_URL}/offline/toggle/`, {
//         method: 'POST',
//         headers: { 
//           'Authorization': `Token ${token}`,
//           'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify({ offline_mode: offlineMode })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const result = await response.json();
//       localStorage.setItem('offlineMode', offlineMode.toString());
//       return result;
//     } catch (error) {
//       console.error('Toggle failed:', error);
//       throw error;
//     }
//   },

//   // Sync offline attempts when back online
//   syncOfflineAttempts: async (token: string): Promise<{synced_count: number; errors: string[]; message: string}> => {
//     try {
//       const offlineAttempts = JSON.parse(localStorage.getItem('offlineAttempts') || '[]');
      
//       if (offlineAttempts.length === 0) {
//         return { synced_count: 0, errors: [], message: 'No offline attempts to sync' };
//       }

//       const response = await fetch(`${BASE_URL}/offline/sync/`, {
//         method: 'POST',
//         headers: { 
//           'Authorization': `Token ${token}`,
//           'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify({ offline_attempts: offlineAttempts })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       // Clear synced attempts
//       if (result.synced_count > 0) {
//         localStorage.removeItem('offlineAttempts');
//       }
      
//       return result;
//     } catch (error) {
//       console.error('Sync failed:', error);
//       throw error;
//     }
//   },

//   // Get offline content from localStorage
//   getOfflineContent: (): OfflineContent | null => {
//     const content = localStorage.getItem('offlineQuizzes');
//     return content ? JSON.parse(content) : null;
//   },

//   // Check if currently in offline mode
//   isOfflineMode: (): boolean => {
//     return localStorage.getItem('offlineMode') === 'true';
//   },

//   // Clear offline data
//   clearOfflineData: (): void => {
//     localStorage.removeItem('offlineQuizzes');
//     localStorage.removeItem('offlineAttempts');
//     localStorage.removeItem('offlineMode');
//   }
// };

// export default offlineAPI;
