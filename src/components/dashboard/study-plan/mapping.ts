import { cn, getMediaUrl } from "@/lib/utils";
import { StudyPlanResponse, TopicTiming } from "@/services/study.service";
import { StudyTopicCardData, getSubjectIconFallback } from "@/components/dashboard/study-plan";

export const mapRoadmapToFrontend = (
  roadmapPlan: any[],
  backendPlans: StudyPlanResponse[],
  timings: TopicTiming[],
  weeklyHistory: any[],
  monthlyHistory: any[],
  userId?: number
): Record<number, StudyTopicCardData[]> => {
  console.log('mapRoadmapToFrontend called with:', {
    roadmapDaysCount: roadmapPlan?.length,
    backendPlansCount: backendPlans?.length,
    timingsCount: timings?.length
  });

  // Create status and row ID maps for quick lookup
  const statusMap: Record<number, string> = {};
  const testRevisionStatusMap: Record<string, string> = {};
  const planRowIdMap: Record<number | string, number> = {};

  if (Array.isArray(roadmapPlan)) {
    roadmapPlan.forEach(dayPlan => {
      if (dayPlan?.items) {
        dayPlan.items.forEach((item: any) => {
          if (item.type === 'TOPIC') {
            const subtopics = Array.isArray(item.topic) ? item.topic : [];
            subtopics.forEach((t: any) => {
              const currentStatus = t.is_completed ? 'COMPLETED' : (t.plan_status || 'ACTIVE');
              // Use plan_row_id as key if available for precision
              if (t.plan_row_id) {
                statusMap[t.plan_row_id] = currentStatus;
                planRowIdMap[t.id] = t.plan_row_id;
              } else {
                // Fallback to t.id (syllabus_id) only if COMPLETED (don't overwrite COMPLETED with ACTIVE)
                if (currentStatus === 'COMPLETED' || !statusMap[t.id]) {
                  statusMap[t.id] = currentStatus;
                }
              }
            });
          } else {
            const currentStatus = item.is_completed ? 'COMPLETED' : (item.plan_status || 'ACTIVE');
            const key = item.plan_row_id || item.identifier || item.title || '';
            if (key) {
              testRevisionStatusMap[key] = currentStatus;
              if (item.plan_row_id) planRowIdMap[item.identifier || item.title || ''] = item.plan_row_id;
            }
          }
        });
      }
    });
  }

  // Create a timing map (sum of total_estimate per syllabus_id)
  const timingMap: Record<number, number> = {};
  const now = new Date();

  if (Array.isArray(timings)) {
    timings.forEach(t => {
      let sessionMinutes = Number(t.total_estimate || 0);
      const isCompleted = (t.plan_id ? statusMap[t.plan_id] === 'COMPLETED' : false) || statusMap[t.syllabus_id] === 'COMPLETED';

      if (!t.end_time && t.start_time && !isCompleted) {
        // If session is still active and topic isn't completed, calculate elapsed time
        const startTimeStr = t.start_time.endsWith('Z') ? t.start_time : `${t.start_time}Z`;
        const start = new Date(startTimeStr);
        if (!isNaN(start.getTime())) {
          sessionMinutes += Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60)));
        }
      }
      timingMap[t.syllabus_id] = (timingMap[t.syllabus_id] || 0) + sessionMinutes;
    });
    console.log('Timing map sample:', Object.entries(timingMap).slice(0, 5));
  }

  const result: Record<number, StudyTopicCardData[]> = {};

  if (!Array.isArray(roadmapPlan)) {
    console.warn('mapRoadmapToFrontend: roadmapPlan is not an array');
    return result;
  }

  roadmapPlan.forEach(dayPlan => {
    if (!dayPlan || !Array.isArray(dayPlan.items)) return;

    result[dayPlan.day] = dayPlan.items.map((item: any, idx: number): StudyTopicCardData => {
      if (item.type === 'TOPIC') {
        const subtopics = Array.isArray(item.topic) ? item.topic : [];
        const completedCount = subtopics.filter((t: any) =>
          (t.plan_row_id && statusMap[t.plan_row_id] === 'COMPLETED') ||
          (!t.plan_row_id && statusMap[t.id] === 'COMPLETED')
        ).length;

        const inProgressCount = subtopics.filter((t: any) => {
          const status = t.plan_row_id ? (statusMap[t.plan_row_id] || statusMap[t.id]) : statusMap[t.id];
          return status === 'IN_PROGRESS' || timingMap[t.id] > 0;
        }).length;

        // Calculate progress including timing for a consistent % with mobile
        let totalTopicProgress = 0;
        subtopics.forEach((t: any) => {
          const status = t.plan_row_id ? (statusMap[t.plan_row_id] || statusMap[t.id]) : statusMap[t.id];
          if (status === 'COMPLETED') {
            totalTopicProgress += 100;
          } else {
            const spent = timingMap[t.id] || 0;
            const planned = t.minutes || 45;
            const timeProgress = Math.min(90, (spent / (planned || 1)) * 100);
            
            // Factor in reading progress from localStorage if available
            let readingProgress = 0;
            if (userId) {
              const savedPercent = localStorage.getItem(`read_percent_${t.id}_${userId}`);
              if (savedPercent) {
                // Reading progress alone can reach up to 90%. Only MCQ makes it 100%.
                readingProgress = Math.min(90, parseFloat(savedPercent));
              }
            }
            
            totalTopicProgress += Math.max(timeProgress, readingProgress);
          }
        });
        const progress = Math.round(totalTopicProgress / (subtopics.length || 1));

        let overallStatus: 'completed' | 'in-progress' | 'start' = 'start';
        if (subtopics.length > 0 && completedCount === subtopics.length) {
          overallStatus = 'completed';
        } else if (completedCount > 0 || inProgressCount > 0) {
          overallStatus = 'in-progress';
        }

        const subjectStr = item.subject || 'Untitled Subject';

        return {
          id: `${subjectStr.toLowerCase().replace(/\s+/g, '-')}-${dayPlan.day}-${idx}`,
          image: getMediaUrl(item.image_url, getSubjectIconFallback(subjectStr)),
          title: subjectStr,
          topicCount: subtopics.length,
          progress,
          status: overallStatus,
          topics: subtopics.map((t: any) => ({ name: t.name || 'Untitled Topic', color: 'bg-[#7C79EC]' })),
          subtopics: subtopics.map((t: any) => ({
            id: t.id ? t.id.toString() : `topic-${idx}-${Math.random()}`,
            name: t.name || 'Untitled Topic',
            description: t.description || '',
            timeSpent: Math.round(timingMap[t.id] || 0),
            totalTime: t.minutes || 0,
            status: ((t.plan_row_id && statusMap[t.plan_row_id] === 'COMPLETED') || (!t.plan_row_id && statusMap[t.id] === 'COMPLETED') ? 'completed' : ((t.plan_row_id ? (statusMap[t.plan_row_id] === 'IN_PROGRESS' || statusMap[t.id] === 'IN_PROGRESS') : statusMap[t.id] === 'IN_PROGRESS') || timingMap[t.id] > 0 ? 'continue' : 'start')) as any,
            planRowId: t.plan_row_id,
          })),
        };
      } else {
        // Handle TEST/REVISION
        const itemIdentifier = item.identifier || item.title || '';
        let statusStr = (item.plan_row_id ? testRevisionStatusMap[item.plan_row_id] : null) || testRevisionStatusMap[itemIdentifier] || 'start';
        const weekNo = Math.ceil(dayPlan.day / 7);

        let timeSpent = 0;
        let totalTime = item.minutes || 0;

        if (item.type === 'TEST' && item.identifier) {
          if (item.identifier.startsWith('WEEK_')) {
            const testNo = parseInt(item.identifier.split('_')[1], 10);
            const historyRec = Array.isArray(weeklyHistory) ? weeklyHistory.find((h: any) => h.week_no === testNo) : null;
            if (historyRec && historyRec.status === 'COMPLETED') {
              statusStr = 'COMPLETED';
              timeSpent = Math.ceil((historyRec.time_spent_seconds || 0) / 60);
            }
          } else if (item.identifier.startsWith('MONTH_')) {
            const testNo = parseInt(item.identifier.split('_')[1], 10);
            const historyRec = Array.isArray(monthlyHistory) ? monthlyHistory.find((h: any) => h.month_no === testNo) : null;
            if (historyRec && historyRec.status === 'COMPLETED') {
              statusStr = 'COMPLETED';
              timeSpent = Math.ceil((historyRec.time_spent_seconds || 0) / 60);
            }
          }
        } else {
          if (statusStr === 'COMPLETED') {
            statusStr = 'COMPLETED';
            timeSpent = item.minutes || 0;
          }
        }

        return {
          id: `${item.type.toLowerCase()}-${dayPlan.day}-${idx}`,
          image: '', // Fallback images will be handled by UI
          title: (item.title || (item.type === 'TEST' ? 'Weekly Test' : 'Revision')).replace('_', ' '),
          topicCount: 1,
          progress: statusStr === 'COMPLETED' ? 100 : 0,
          type: item.type,
          status: statusStr === 'COMPLETED' ? 'completed' : statusStr === 'IN_PROGRESS' ? 'in-progress' : 'start',
          topics: [{ name: item.description || 'Assessment', color: item.type === 'TEST' ? 'bg-[#FF3B30]' : 'bg-[#34C759]' }],
          subtopics: [{
            id: `sub-${item.type.toLowerCase()}-${dayPlan.day}-${idx}`,
            name: (item.title || item.type).replace('_', ' '),
            description: item.description || 'Scheduled activity',
            timeSpent: timeSpent,
            totalTime: totalTime,
            status: (statusStr === 'COMPLETED' ? 'completed' : statusStr === 'IN_PROGRESS' ? 'continue' : 'start') as any,
            planRowId: item.plan_row_id,
            isTest: item.type === 'TEST',
            testType: item.identifier?.startsWith('MONTH_') ? 'MONTHLY' : 'WEEKLY',
            weeklyTestId: item.weekly_test_id,
            weekNo: item.identifier?.startsWith('WEEK_') ? parseInt(item.identifier.split('_')[1], 10) : (item.identifier?.startsWith('MONTH_') ? undefined : weekNo),
            monthNo: item.identifier?.startsWith('MONTH_') ? parseInt(item.identifier.split('_')[1], 10) : undefined
          }],
        };
      }
    });
  });

  console.log('mapRoadmapToFrontend finished. Result keys:', Object.keys(result));
  return result;
};

export const mapBackendPlanToFrontend = (
  backendPlans: StudyPlanResponse[],
  topicTimings: TopicTiming[]
): Record<number, StudyTopicCardData[]> => {
  const groupedByDay: Record<number, StudyPlanResponse[]> = {};
  backendPlans.forEach(plan => {
    if (!groupedByDay[plan.day_no]) groupedByDay[plan.day_no] = [];
    groupedByDay[plan.day_no].push(plan);
  });

  const result: Record<number, StudyTopicCardData[]> = {};
  Object.entries(groupedByDay).forEach(([day, plans]) => {
    const dayNo = parseInt(day);
    const groupedBySubject: Record<string, StudyPlanResponse[]> = {};
    plans.forEach(plan => {
      if (!groupedBySubject[plan.subject]) groupedBySubject[plan.subject] = [];
      groupedBySubject[plan.subject].push(plan);
    });

    result[dayNo] = Object.entries(groupedBySubject).map(([subject, items]): StudyTopicCardData => {
      // Build a local timing map for this calculation
      const localTimingMap: Record<number, number> = {};
      const now = new Date();
      topicTimings.forEach(t => {
        let m = Number(t.total_estimate || 0);
        // Find if this specific syllabus_id is marked as completed in current context
        const planItem = backendPlans.find(bp => bp.syllabus_id === t.syllabus_id);
        const isAlreadyDone = planItem?.is_completed || planItem?.plan_status === 'COMPLETED';

        if (!t.end_time && t.start_time && !isAlreadyDone) {
          const startTimeStr = t.start_time.endsWith('Z') ? t.start_time : `${t.start_time}Z`;
          const start = new Date(startTimeStr);
          if (!isNaN(start.getTime())) m += Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60)));
        }
        localTimingMap[t.syllabus_id] = (localTimingMap[t.syllabus_id] || 0) + m;
      });

      // Priority based status check for items in grouped subject
      const completedCount = items.filter(i => i.is_completed || i.plan_status === 'COMPLETED').length;
      const inProgressCount = items.filter(i => (i.plan_status === 'IN_PROGRESS' || (localTimingMap[i.syllabus_id] > 0)) && !i.is_completed).length;

      console.log(`Processing subject ${subject}: completed=${completedCount}, inProgress=${inProgressCount}, total=${items.length}`);

      let totalItemProgress = 0;
      items.forEach(i => {
        const isCompleted = i.is_completed || i.plan_status === 'COMPLETED';
        if (isCompleted) {
          totalItemProgress += 100;
        } else {
          const spent = localTimingMap[i.syllabus_id] || 0;
          totalItemProgress += Math.min(90, (spent / (i.minutes || 45)) * 100);
        }
      });
      const progress = Math.round(totalItemProgress / (items.length || 1));

      let overallStatus: 'completed' | 'in-progress' | 'start' = 'start';
      if (items.length > 0 && completedCount === items.length) {
        overallStatus = 'completed';
      } else if (completedCount > 0 || inProgressCount > 0) {
        overallStatus = 'in-progress';
      }

      return {
        id: `${subject.toLowerCase().replace(/\s+/g, '-')}-${dayNo}`,
        image: getMediaUrl(null, getSubjectIconFallback(subject)),
        title: subject,
        topicCount: items.length,
        progress,
        status: overallStatus,
        topics: Array.from(new Set(items.map(i => i.chapter))).map(ch => ({ name: ch, color: 'bg-[#7C79EC]' })),
        subtopics: items.map(i => {
          const spent = localTimingMap[i.syllabus_id] || 0;
          const isCompleted = i.is_completed || i.plan_status === 'COMPLETED';
          return {
            id: i.id.toString(), name: i.topic, description: `Chapter: ${i.chapter}`,
            timeSpent: Math.round(spent || (isCompleted ? i.minutes : 0)),
            totalTime: i.minutes,
            status: isCompleted ? 'completed' as const : (i.plan_status === 'IN_PROGRESS' || spent > 0) ? 'continue' as const : 'start' as const,
          };
        }),
      };
    });
  });
  return result;
};
