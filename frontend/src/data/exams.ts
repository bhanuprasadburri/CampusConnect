export interface Exam {
  date: Date;
  start: string;
  end: string;
  code: string;
  subject: string;
  type: string;
  room: string;
  seat: string;
}

export const getUpcomingExams = (from = new Date()): Exam[] => {
  const month = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  const schedule = [
    { day: 2, start: '09:30 AM', end: '11:30 AM', code: 'CS503', subject: 'Data Structures & Algorithms', room: 'Examination Hall - Block A', seat: 'B1-24' },
    { day: 6, start: '02:00 PM', end: '04:00 PM', code: 'CS502', subject: 'Web Technologies', room: 'Examination Hall - Block A', seat: 'B1-25' },
    { day: 9, start: '09:30 AM', end: '11:30 AM', code: 'CS501', subject: 'Database Management Systems', room: 'Examination Hall - Block A', seat: 'B1-26' },
    { day: 13, start: '02:00 PM', end: '04:00 PM', code: 'CS504', subject: 'Computer Networks', room: 'Examination Hall - Block B', seat: 'B2-11' },
    { day: 16, start: '09:30 AM', end: '11:30 AM', code: 'CS505', subject: 'Operating Systems', room: 'Examination Hall - Block B', seat: 'B2-12' },
    { day: 20, start: '02:00 PM', end: '04:00 PM', code: 'CS506', subject: 'Software Engineering', room: 'Examination Hall - Block C', seat: 'C1-08' },
    { day: 23, start: '09:30 AM', end: '11:30 AM', code: 'CS507', subject: 'Mathematics', room: 'Examination Hall - Block C', seat: 'C1-09' },
  ];

  return schedule.map((exam) => ({
    ...exam,
    date: new Date(month.getFullYear(), month.getMonth(), exam.day),
    type: 'Theory',
  }));
};
