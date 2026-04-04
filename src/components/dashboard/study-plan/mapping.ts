import { cn, getMediaUrl } from "@/lib/utils";
import { StudyPlanResponse, TopicTiming } from "@/services/study.service";
import { StudyTopicCardData, getSubjectIconFallback } from "@/components/dashboard/study-plan";

export const mapRoadmapToFrontend = (
  roadmapPlan: any[],
  backendPlans: StudyPlanResponse[],
  timings: TopicTiming[],
  weeklyHistory: any[],
  monthlyHistory: any[]
): Record<number, StudyTopicCardData[]> => {
  console.log('mapRoadmapToFrontend called with:', {
    roadmapDaysCount: roadmapPlan?.length,
    backendPlansCount: backendPlans?.length,
    timingsCount: timings?.length
  });

  // Create a status map for quick lookup
  const statusMap: Record<number, string> = {};
  const testRevisionStatusMap: Record<string, string> = {};

  if (Array.isArray(backendPlans)) {
    console.log('Building statusMap from backendPlans...');
    backendPlans.forEach(p => {
      const currentStatus = p.is_completed ? 'COMPLETED' : (p.plan_status || 'ACTIVE');

      if (p.syllabus_id) {
        const existingStatus = statusMap[p.syllabus_id];
        // Priority: COMPLETED (3) > IN_PROGRESS (2) > ACTIVE (1)
        if (!existingStatus ||
          currentStatus === 'COMPLETED' ||
          (currentStatus === 'IN_PROGRESS' && existingStatus === 'ACTIVE')) {
          statusMap[p.syllabus_id] = currentStatus;
        }
      } else if (p.topic) {
        const key = p.topic;
        const existingStatus = testRevisionStatusMap[key];
        if (!existingStatus ||
          currentStatus === 'COMPLETED' ||
          (currentStatus === 'IN_PROGRESS' && existingStatus === 'ACTIVE')) {
          testRevisionStatusMap[key] = currentStatus;
        }
      }
    });
    console.log('Status map sample:', Object.entries(statusMap).slice(0, 5));
  }

  // Create a timing map (sum of total_estimate per syllabus_id)
  const timingMap: Record<number, number> = {};
  const now = new Date();

  if (Array.isArray(timings)) {
    timings.forEach(t => {
      let sessionMinutes = Number(t.total_estimate || 0);
      const isCompleted = statusMap[t.syllabus_id] === 'COMPLETED';
      
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
        const completedCount = subtopics.filter((t: any) => statusMap[t.id] === 'COMPLETED').length;
        const inProgressCount = subtopics.filter((t: any) => statusMap[t.id] === 'IN_PROGRESS' || timingMap[t.id] > 0).length;

        // Calculate progress including timing for a consistent % with mobile
        let totalTopicProgress = 0;
        subtopics.forEach((t: any) => {
          if (statusMap[t.id] === 'COMPLETED') {
            totalTopicProgress += 100;
          } else {
            const spent = timingMap[t.id] || 0;
            const planned = t.minutes || 45;
            totalTopicProgress += Math.min(90, (spent / (planned || 1)) * 100);
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
            status: (statusMap[t.id] === 'COMPLETED' ? 'completed' : (statusMap[t.id] === 'IN_PROGRESS' || timingMap[t.id] > 0 ? 'continue' : 'start')) as any,
          })),
        };
      } else {
        // Handle TEST/REVISION
        const itemIdentifier = item.identifier || item.title || '';
        let statusStr = testRevisionStatusMap[itemIdentifier] || 'start';
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
