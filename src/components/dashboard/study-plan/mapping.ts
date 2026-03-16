import { StudyPlanResponse, TopicTiming } from "@/services/study.service";
import { StudyTopicCardData, getSubjectIconFallback } from "@/components/dashboard/study-plan";

export const mapRoadmapToFrontend = (
  roadmapPlan: any[],
  backendPlans: StudyPlanResponse[],
  timings: TopicTiming[],
  weeklyHistory: any[],
  monthlyHistory: any[]
): Record<number, StudyTopicCardData[]> => {
  // Create a status map for quick lookup
  const statusMap: Record<number, string> = {};
  backendPlans.forEach(p => {
    if (p.syllabus_id) statusMap[p.syllabus_id] = p.plan_status;
  });

  // Create a timing map (sum of total_estimate per syllabus_id)
  const timingMap: Record<number, number> = {};
  timings.forEach(t => {
    timingMap[t.syllabus_id] = (timingMap[t.syllabus_id] || 0) + (t.total_estimate || 0);
  });

  const result: Record<number, StudyTopicCardData[]> = {};
  roadmapPlan.forEach(dayPlan => {
    result[dayPlan.day] = dayPlan.items.map((item: any, idx: number): StudyTopicCardData => {
      if (item.type === 'TOPIC') {
        const completedCount = item.topic.filter((t: any) => statusMap[t.id] === 'COMPLETED').length;
        const progress = Math.round((completedCount / (item.topic.length || 1)) * 100);

        return {
          id: `${item.subject.toLowerCase().replace(/\s+/g, '-')}-${dayPlan.day}-${idx}`,
          image: item.image_url || getSubjectIconFallback(item.subject),
          title: item.subject,
          topicCount: item.topic.length,
          progress,
          topics: item.topic.map((t: any) => ({ name: t.name, color: 'bg-[#7C79EC]' })),
          subtopics: item.topic.map((t: any) => ({
            id: t.id.toString(),
            name: t.name,
            description: t.description,
            timeSpent: Math.round(timingMap[t.id] || 0),
            totalTime: t.minutes,
            status: (statusMap[t.id] === 'COMPLETED' ? 'completed' : statusMap[t.id] === 'IN_PROGRESS' ? 'continue' : 'start') as any,
          })),
        };
      } else {
        // Handle TEST/REVISION
        let statusStr = statusMap[dayPlan.day] || 'start'; // This is simplified for tests
        const weekNo = Math.ceil(dayPlan.day / 7);

        let timeSpent = 0;
        let totalTime = item.minutes;

        if (item.type === 'TEST' && item.identifier) {
          if (item.identifier.startsWith('WEEK_')) {
            const testNo = parseInt(item.identifier.split('_')[1], 10);
            const historyRec = weeklyHistory.find((h: any) => h.week_no === testNo);
            if (historyRec && historyRec.status === 'COMPLETED') {
              statusStr = 'COMPLETED';
              timeSpent = Math.ceil((historyRec.time_spent_seconds || 0) / 60);
            }
          } else if (item.identifier.startsWith('MONTH_')) {
            const testNo = parseInt(item.identifier.split('_')[1], 10);
            const historyRec = monthlyHistory.find((h: any) => h.month_no === testNo);
            if (historyRec && historyRec.status === 'COMPLETED') {
              statusStr = 'COMPLETED';
              timeSpent = Math.ceil((historyRec.time_spent_seconds || 0) / 60);
            }
          }
        } else {
          if (statusStr === 'COMPLETED') {
            timeSpent = item.minutes;
          }
        }

        return {
          id: `${item.type.toLowerCase()}-${dayPlan.day}-${idx}`,
          image: item.type === 'TEST' ? '' : '', // Fallback images will be handled by UI
          title: (item.title || (item.type === 'TEST' ? 'Weekly Test' : 'Revision')).replace('_', ' '),
          topicCount: 1,
          progress: statusStr === 'COMPLETED' ? 100 : 0,
          type: item.type,
          topics: [{ name: item.description || 'Assessment', color: item.type === 'TEST' ? 'bg-[#FF3B30]' : 'bg-[#34C759]' }],
          subtopics: [{
            id: `sub-${item.type.toLowerCase()}-${dayPlan.day}-${idx}`,
            name: (item.title || item.type).replace('_', ' '),
            description: item.description || 'Scheduled activity',
            timeSpent: timeSpent,
            totalTime: totalTime,
            status: (statusStr === 'COMPLETED' ? 'completed' : statusStr === 'IN_PROGRESS' ? 'continue' : 'start') as any,
            isTest: item.type === 'TEST',
            weeklyTestId: item.weekly_test_id,
            weekNo: item.identifier?.startsWith('MONTH_') ? parseInt(item.identifier.split('_')[1], 10) : weekNo
          }],
        };
      }
    });
  });
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
      const completedCount = items.filter(i => i.plan_status === 'COMPLETED').length;
      const progress = Math.round((completedCount / (items.length || 1)) * 100);
      return {
        id: `${subject.toLowerCase().replace(/\s+/g, '-')}-${dayNo}`,
        image: getSubjectIconFallback(subject),
        title: subject,
        topicCount: items.length,
        progress,
        topics: Array.from(new Set(items.map(i => i.chapter))).map(ch => ({ name: ch, color: 'bg-[#7C79EC]' })),
        subtopics: items.map(i => {
          const sumTimings = topicTimings
            .filter(t => t.syllabus_id === i.syllabus_id)
            .reduce((acc, curr) => acc + (curr.total_estimate || 0), 0);
          return {
            id: i.id.toString(), name: i.topic, description: `Chapter: ${i.chapter}`,
            timeSpent: Math.round(sumTimings || (i.plan_status === 'COMPLETED' ? i.minutes : 0)),
            totalTime: i.minutes,
            status: i.plan_status === 'COMPLETED' ? 'completed' as const : i.plan_status === 'IN_PROGRESS' ? 'continue' as const : 'start' as const,
          };
        }),
      };
    });
  });
  return result;
};
