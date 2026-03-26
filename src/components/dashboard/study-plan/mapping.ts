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
    backendPlans.forEach(p => {
      if (p.syllabus_id) {
        statusMap[p.syllabus_id] = p.is_completed ? 'COMPLETED' : p.plan_status;
      } else if (p.topic) {
        testRevisionStatusMap[p.topic] = p.is_completed ? 'COMPLETED' : p.plan_status;
      }
    });
  }

  // Create a timing map (sum of total_estimate per syllabus_id)
  const timingMap: Record<number, number> = {};
  if (Array.isArray(timings)) {
    timings.forEach(t => {
      timingMap[t.syllabus_id] = (timingMap[t.syllabus_id] || 0) + (t.total_estimate || 0);
    });
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
        const completedCount = subtopics.filter((t: any) => t.is_completed || statusMap[t.id] === 'COMPLETED').length;
        const inProgressCount = subtopics.filter((t: any) => !t.is_completed && (statusMap[t.id] === 'IN_PROGRESS' || timingMap[t.id] > 0)).length;
        
        // Calculate progress including timing for a consistent % with mobile
        let totalTopicProgress = 0;
        subtopics.forEach((t: any) => {
          if (t.is_completed || statusMap[t.id] === 'COMPLETED') {
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
            status: (t.is_completed || statusMap[t.id] === 'COMPLETED' ? 'completed' : (statusMap[t.id] === 'IN_PROGRESS' || timingMap[t.id] > 0 ? 'continue' : 'start')) as any,
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
          if (item.is_completed || statusStr === 'COMPLETED') {
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
      const completedCount = items.filter(i => i.is_completed || i.plan_status === 'COMPLETED').length;
      const inProgressCount = items.filter(i => (i.plan_status === 'IN_PROGRESS' || (topicTimings.filter(tt => tt.syllabus_id === i.syllabus_id).reduce((acc, curr) => acc + (curr.total_estimate || 0), 0) > 0)) && !i.is_completed).length;
      
      let totalItemProgress = 0;
      items.forEach(i => {
        if (i.is_completed || i.plan_status === 'COMPLETED') {
          totalItemProgress += 100;
        } else {
          const sumTimings = topicTimings
            .filter(t => t.syllabus_id === i.syllabus_id)
            .reduce((acc, curr) => acc + (curr.total_estimate || 0), 0);
          totalItemProgress += Math.min(90, (sumTimings / (i.minutes || 45)) * 100);
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
          const sumTimings = topicTimings
            .filter(t => t.syllabus_id === i.syllabus_id)
            .reduce((acc, curr) => acc + (curr.total_estimate || 0), 0);
          return {
            id: i.id.toString(), name: i.topic, description: `Chapter: ${i.chapter}`,
            timeSpent: Math.round(sumTimings || (i.is_completed ? i.minutes : 0)),
            totalTime: i.minutes,
            status: (i.is_completed || i.plan_status === 'COMPLETED') ? 'completed' as const : (i.plan_status === 'IN_PROGRESS' || sumTimings > 0) ? 'continue' as const : 'start' as const,
          };
        }),
      };
    });
  });
  return result;
};
