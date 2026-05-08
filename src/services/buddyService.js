import api from './api';

const buddyService = {
  getMyPair:        ()                    => api.get('/buddy/my-pair'),
  getMyScore:       ()                    => api.get('/buddy/my-score'),
  getHistory:       (params)              => api.get('/buddy/history', { params }),
  answerChecklist:  (pairId, itemId, answer) => api.put(`/buddy/${pairId}/checklist/${itemId}`, { answer }),
  confirmVerify:    (pairId, notes)       => api.put(`/buddy/${pairId}/confirm`, { notes }),
  getAllTodayPairs:  ()                    => api.get('/buddy/today'),
  createDailyPairs: (data)                => api.post('/buddy/create-pairs', data),
  getLeaderboard:   (type = 'monthly')    => api.get(`/buddy/leaderboard?type=${type}`),
};

export default buddyService;